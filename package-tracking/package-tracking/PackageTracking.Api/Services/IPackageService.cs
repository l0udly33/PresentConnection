public interface IPackageService
{
    Task<IEnumerable<Package>> GetAllAsync(string? trackingNumber, PackageStatus? status);
    Task<Package?> GetByIdAsync(int id);
    Task<Package> CreateAsync(CreatePackageDto dto);
    Task<(bool Success, string? Error)> ChangeStatusAsync(int id, PackageStatus newStatus);
}