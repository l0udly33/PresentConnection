using Microsoft.EntityFrameworkCore;

public class PackageService : IPackageService
{
    private readonly AppDbContext _db;

    private static readonly Dictionary<PackageStatus, PackageStatus[]> AllowedTransitions = new()
    {
        { PackageStatus.Created, new[] { PackageStatus.Sent, PackageStatus.Canceled } },
        { PackageStatus.Sent, new[] { PackageStatus.Accepted, PackageStatus.Returned, PackageStatus.Canceled } },
        { PackageStatus.Returned, new[] { PackageStatus.Sent, PackageStatus.Canceled } },
        { PackageStatus.Accepted, Array.Empty<PackageStatus>() },
        { PackageStatus.Canceled, Array.Empty<PackageStatus>() }
    };

    public PackageService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Package>> GetAllAsync(string? trackingNumber, PackageStatus? status)
    {
        var q = _db.Packages.Include(p => p.StatusHistory).AsQueryable();
        if (!string.IsNullOrWhiteSpace(trackingNumber))
            q = q.Where(p => p.TrackingNumber.Contains(trackingNumber));
        if (status != null)
            q = q.Where(p => p.CurrentStatus == status.Value);
        return await q.OrderByDescending(p => p.CreatedAt).ToListAsync();
    }

    public async Task<Package?> GetByIdAsync(int id) =>
        await _db.Packages.Include(p => p.StatusHistory).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Package> CreateAsync(CreatePackageDto dto)
    {
        var pkg = new Package
        {
            TrackingNumber = GenerateTrackingNumber(),
            SenderName = dto.SenderName,
            SenderAddress = dto.SenderAddress,
            SenderPhone = dto.SenderPhone,
            RecipientName = dto.RecipientName,
            RecipientAddress = dto.RecipientAddress,
            RecipientPhone = dto.RecipientPhone,
            CurrentStatus = PackageStatus.Created,
            CreatedAt = DateTime.UtcNow
        };

        var history = new PackageStatusHistory
        {
            Status = PackageStatus.Created,
            Timestamp = pkg.CreatedAt
        };
        pkg.StatusHistory.Add(history);

        _db.Packages.Add(pkg);
        await _db.SaveChangesAsync();
        return pkg;
    }

    public async Task<(bool Success, string? Error)> ChangeStatusAsync(int id, PackageStatus newStatus)
    {
        var pkg = await _db.Packages.Include(p => p.StatusHistory).FirstOrDefaultAsync(p => p.Id == id);
        if (pkg == null) return (false, "Package not found");

        if (!AllowedTransitions.TryGetValue(pkg.CurrentStatus, out var allowed))
            return (false, "Current status has no allowed transitions");

        if (!allowed.Contains(newStatus))
            return (false, $"Cannot change status from {pkg.CurrentStatus} to {newStatus}");
            
        pkg.CurrentStatus = newStatus;
        var hist = new PackageStatusHistory { PackageId = pkg.Id, Status = newStatus, Timestamp = DateTime.UtcNow };
        pkg.StatusHistory.Add(hist);

        await _db.SaveChangesAsync();
        return (true, null);
    }

    private string GenerateTrackingNumber()
    {
        return $"PKG-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0,6).ToUpper()}";
    }
}