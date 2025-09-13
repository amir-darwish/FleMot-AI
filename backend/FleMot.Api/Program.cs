var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); 



var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "FleMot API V1");
        options.RoutePrefix = "swagger"; 
    });
}



app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();