using Infrastructure;
using Persistence;
using API.Extensions;
using API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// CORS — Mobil uygulama erişimi için
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

builder.Services.AddSignalR();

builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices();
builder.Services.AddAutoMapper(typeof(Application.Mappings.GeneralMapping));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "EatWellFeelWell API",
        Version = "v1",
        Description = "Gıda analizi ve sağlıklı beslenme API'si"
    });
});

var app = builder.Build();

// ✅ Global Exception Handler — EN ÜSTTEKİ middleware
app.UseGlobalExceptionHandler();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "EatWellFeelWell API v1");
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chathub");

app.Run();
