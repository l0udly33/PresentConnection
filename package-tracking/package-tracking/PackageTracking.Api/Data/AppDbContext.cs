using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Package> Packages => Set<Package>();
    public DbSet<PackageStatusHistory> StatusHistories => Set<PackageStatusHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Package>()
            .HasMany(p => p.StatusHistory)
            .WithOne()
            .HasForeignKey(h => h.PackageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}