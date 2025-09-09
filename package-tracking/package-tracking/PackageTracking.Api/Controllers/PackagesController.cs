using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class PackagesController : ControllerBase
{
    private readonly IPackageService _svc;

    public PackagesController(IPackageService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? trackingNumber, [FromQuery] PackageStatus? status)
    {
        var list = await _svc.GetAllAsync(trackingNumber, status);
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var pkg = await _svc.GetByIdAsync(id);
        if (pkg == null) return NotFound();
        return Ok(pkg);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePackageDto dto)
    {
        var pkg = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = pkg.Id }, pkg);
    }

    [HttpPost("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusDto dto)
    {
        var (success, error) = await _svc.ChangeStatusAsync(id, dto.NewStatus);
        if (!success) return BadRequest(new { error });
        return Ok();
    }
}
