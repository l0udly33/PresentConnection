using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("PackageTrackingDb"));

builder.Services.AddScoped<IPackageService, PackageService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocal", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!db.Packages.Any())
    {
        var svc = new PackageService(db);
        svc.CreateAsync(new CreatePackageDto {
            SenderName="Alice", SenderAddress="Street 1", SenderPhone="111",
            RecipientName="Bob", RecipientAddress="Street 2", RecipientPhone="222"
        }).Wait();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowLocal");
app.UseAuthorization();
app.MapControllers();

app.Run("http://localhost:5000");
