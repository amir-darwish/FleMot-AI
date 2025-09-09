# --- Étape 1 : Construction ---
# Image avec SDK .NET pour compiler
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build  

# Dossier de travail
WORKDIR /src  

# Copier fichier projet + restaurer dépendances (cache utile)
COPY ["FleMot.Api/FleMot.Api.csproj", "FleMot.Api/"]  
RUN dotnet restore "FleMot.Api/FleMot.Api.csproj"  

# Copier le reste du code
COPY . .  
WORKDIR "/src/FleMot.Api"  

# Compiler en mode Release
RUN dotnet build "FleMot.Api.csproj" -c Release -o /app/build  

# Publier version finale légère
FROM build AS publish  
RUN dotnet publish "FleMot.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false  

# --- Étape 2 : Image finale ---
# Image runtime seulement (sans SDK)
FROM mcr.microsoft.com/dotnet/aspnet:9.0  
WORKDIR /app  

# Copier fichiers publiés
COPY --from=publish /app/publish .  

# Ouvrir port 8080
EXPOSE 8080  

# Lancer l’application
ENTRYPOINT ["dotnet", "FleMot.Api.dll"]  
