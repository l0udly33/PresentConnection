public class Package
{
    public int Id { get; set; }
    public string TrackingNumber { get; set; } = null!;
    public string SenderName { get; set; } = null!;
    public string SenderAddress { get; set; } = null!;
    public string SenderPhone { get; set; } = null!;
    public string RecipientName { get; set; } = null!;
    public string RecipientAddress { get; set; } = null!;
    public string RecipientPhone { get; set; } = null!;
    public PackageStatus CurrentStatus { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PackageStatusHistory> StatusHistory { get; set; } = new();
}