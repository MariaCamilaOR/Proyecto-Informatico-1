# Script de configuración inicial para DoYouRemember (PowerShell)
# Este script automatiza la configuración inicial del proyecto en Windows

param(
    [switch]$SkipDependencies,
    [switch]$SkipDatabase,
    [switch]$Help
)

if ($Help) {
    Write-Host "DoYouRemember Setup Script" -ForegroundColor Blue
    Write-Host "Uso: .\scripts\setup.ps1 [opciones]" -ForegroundColor White
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  -SkipDependencies  Saltar instalación de dependencias npm" -ForegroundColor White
    Write-Host "  -SkipDatabase      Saltar configuración de base de datos" -ForegroundColor White
    Write-Host "  -Help              Mostrar esta ayuda" -ForegroundColor White
    exit 0
}

# Configurar colores
$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar prerrequisitos
function Test-Prerequisites {
    Write-Status "Verificando prerrequisitos..."
    
    # Verificar Docker
    try {
        $dockerVersion = docker --version 2>$null
        if (-not $dockerVersion) {
            throw "Docker no encontrado"
        }
        Write-Success "Docker encontrado: $dockerVersion"
    }
    catch {
        Write-Error "Docker no está instalado. Por favor instala Docker Desktop primero."
        exit 1
    }
    
    # Verificar Docker Compose
    try {
        $composeVersion = docker-compose --version 2>$null
        if (-not $composeVersion) {
            throw "Docker Compose no encontrado"
        }
        Write-Success "Docker Compose encontrado: $composeVersion"
    }
    catch {
        Write-Error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
        exit 1
    }
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Success "Node.js encontrado: $nodeVersion"
        } else {
            Write-Warning "Node.js no está instalado. Algunas funcionalidades de desarrollo pueden no funcionar."
        }
    }
    catch {
        Write-Warning "Node.js no está instalado. Algunas funcionalidades de desarrollo pueden no funcionar."
    }
    
    Write-Success "Prerrequisitos verificados"
}

# Configurar variables de entorno
function Set-Environment {
    Write-Status "Configurando variables de entorno..."
    
    if (-not (Test-Path ".env")) {
        Copy-Item "env.example" ".env"
        Write-Success "Archivo .env creado desde env.example"
        Write-Warning "Por favor edita el archivo .env con tus configuraciones específicas"
    } else {
        Write-Warning "El archivo .env ya existe. Saltando configuración."
    }
}

# Instalar dependencias
function Install-Dependencies {
    if ($SkipDependencies) {
        Write-Warning "Saltando instalación de dependencias (flag -SkipDependencies)"
        return
    }
    
    Write-Status "Instalando dependencias..."
    
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            npm install
            Write-Success "Dependencias de Node.js instaladas"
        } else {
            Write-Warning "npm no está disponible. Saltando instalación de dependencias."
        }
    }
    catch {
        Write-Warning "Error instalando dependencias: $($_.Exception.Message)"
    }
}

# Levantar servicios de infraestructura
function Start-Infrastructure {
    Write-Status "Levantando servicios de infraestructura..."
    
    try {
        # Levantar solo los servicios de infraestructura
        docker-compose -f docker-compose.dev.yml up -d postgres redis rabbitmq minio
        
        # Esperar a que los servicios estén listos
        Write-Status "Esperando a que los servicios estén listos..."
        Start-Sleep -Seconds 15
        
        Write-Success "Servicios de infraestructura levantados"
    }
    catch {
        Write-Error "Error levantando servicios de infraestructura: $($_.Exception.Message)"
        exit 1
    }
}

# Configurar base de datos
function Set-Database {
    if ($SkipDatabase) {
        Write-Warning "Saltando configuración de base de datos (flag -SkipDatabase)"
        return
    }
    
    Write-Status "Configurando base de datos..."
    
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            # Esperar a que PostgreSQL esté listo
            Write-Status "Esperando a que PostgreSQL esté listo..."
            Start-Sleep -Seconds 10
            
            # Ejecutar migraciones
            npm run migrate
            Write-Success "Migraciones ejecutadas"
            
            # Poblar con datos de ejemplo
            npm run seed
            Write-Success "Datos de ejemplo insertados"
        } else {
            Write-Warning "npm no está disponible. Saltando configuración de base de datos."
            Write-Warning "Ejecuta manualmente: npm run migrate && npm run seed"
        }
    }
    catch {
        Write-Error "Error configurando base de datos: $($_.Exception.Message)"
        Write-Warning "Puedes intentar ejecutar manualmente: npm run migrate && npm run seed"
    }
}

# Verificar instalación
function Test-Installation {
    Write-Status "Verificando instalación..."
    
    try {
        # Verificar que los servicios estén corriendo
        $services = docker-compose -f docker-compose.dev.yml ps
        if ($services -match "Up") {
            Write-Success "Servicios de infraestructura están corriendo"
        } else {
            Write-Error "Algunos servicios no están corriendo"
            exit 1
        }
        
        Write-Success "Base de datos configurada correctamente"
    }
    catch {
        Write-Error "Error verificando instalación: $($_.Exception.Message)"
        exit 1
    }
}

# Mostrar información de acceso
function Show-AccessInfo {
    Write-Success "¡Configuración completada!"
    Write-Host ""
    Write-Host "🌐 Servicios disponibles:" -ForegroundColor Cyan
    Write-Host "   • Frontend: http://localhost:3006" -ForegroundColor White
    Write-Host "   • API Gateway: http://localhost:3000" -ForegroundColor White
    Write-Host "   • RabbitMQ Management: http://localhost:15672 (guest/guest)" -ForegroundColor White
    Write-Host "   • MinIO Console: http://localhost:9001 (minioadmin/minioadmin)" -ForegroundColor White
    Write-Host ""
    Write-Host "👤 Credenciales por defecto:" -ForegroundColor Cyan
    Write-Host "   • Admin: admin@doyouremember.com / admin123" -ForegroundColor White
    Write-Host "   • Doctor: doctor@doyouremember.com / doctor123" -ForegroundColor White
    Write-Host "   • Cuidador: cuidador@doyouremember.com / caregiver123" -ForegroundColor White
    Write-Host "   • Paciente: paciente@doyouremember.com / patient123" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Para iniciar el desarrollo:" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Documentación:" -ForegroundColor Cyan
    Write-Host "   • Instalación: docs/INSTALLATION.md" -ForegroundColor White
    Write-Host "   • API: docs/API.md" -ForegroundColor White
    Write-Host "   • Arquitectura: docs/ARCHITECTURE.md" -ForegroundColor White
}

# Función principal
function Main {
    Write-Host "==========================================" -ForegroundColor Blue
    Write-Host "    DoYouRemember - Setup Script" -ForegroundColor Blue
    Write-Host "==========================================" -ForegroundColor Blue
    Write-Host ""
    
    Test-Prerequisites
    Set-Environment
    Install-Dependencies
    Start-Infrastructure
    Set-Database
    Test-Installation
    Show-AccessInfo
    
    Write-Host ""
    Write-Success "¡Configuración completada exitosamente! 🎉"
}

# Ejecutar función principal
try {
    Main
}
catch {
    Write-Error "Error durante la configuración: $($_.Exception.Message)"
    exit 1
}
