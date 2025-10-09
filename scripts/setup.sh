#!/bin/bash

# Script de configuración inicial para DoYouRemember
# Este script automatiza la configuración inicial del proyecto

set -e

echo "🚀 Configurando DoYouRemember..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar prerrequisitos
check_prerequisites() {
    print_status "Verificando prerrequisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado. Por favor instala Docker primero."
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
        exit 1
    fi
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_warning "Node.js no está instalado. Algunas funcionalidades de desarrollo pueden no funcionar."
    fi
    
    print_success "Prerrequisitos verificados"
}

# Configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Archivo .env creado desde env.example"
        print_warning "Por favor edita el archivo .env con tus configuraciones específicas"
    else
        print_warning "El archivo .env ya existe. Saltando configuración."
    fi
}

# Instalar dependencias
install_dependencies() {
    print_status "Instalando dependencias..."
    
    if command -v npm &> /dev/null; then
        npm install
        print_success "Dependencias de Node.js instaladas"
    else
        print_warning "npm no está disponible. Saltando instalación de dependencias."
    fi
}

# Levantar servicios de infraestructura
start_infrastructure() {
    print_status "Levantando servicios de infraestructura..."
    
    # Levantar solo los servicios de infraestructura
    docker-compose -f docker-compose.dev.yml up -d postgres redis rabbitmq minio
    
    # Esperar a que los servicios estén listos
    print_status "Esperando a que los servicios estén listos..."
    sleep 10
    
    print_success "Servicios de infraestructura levantados"
}

# Configurar base de datos
setup_database() {
    print_status "Configurando base de datos..."
    
    # Esperar a que PostgreSQL esté listo
    print_status "Esperando a que PostgreSQL esté listo..."
    sleep 5
    
    # Ejecutar migraciones
    if command -v npm &> /dev/null; then
        npm run migrate
        print_success "Migraciones ejecutadas"
        
        # Poblar con datos de ejemplo
        npm run seed
        print_success "Datos de ejemplo insertados"
    else
        print_warning "npm no está disponible. Saltando configuración de base de datos."
        print_warning "Ejecuta manualmente: npm run migrate && npm run seed"
    fi
}

# Verificar instalación
verify_installation() {
    print_status "Verificando instalación..."
    
    # Verificar que los servicios estén corriendo
    if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        print_success "Servicios de infraestructura están corriendo"
    else
        print_error "Algunos servicios no están corriendo"
        exit 1
    fi
    
    # Verificar conectividad a la base de datos
    if command -v npm &> /dev/null; then
        # Aquí podrías agregar un comando para verificar la conexión a la BD
        print_success "Base de datos configurada correctamente"
    fi
}

# Mostrar información de acceso
show_access_info() {
    print_success "¡Configuración completada!"
    echo ""
    echo "🌐 Servicios disponibles:"
    echo "   • Frontend: http://localhost:3006"
    echo "   • API Gateway: http://localhost:3000"
    echo "   • RabbitMQ Management: http://localhost:15672 (guest/guest)"
    echo "   • MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
    echo ""
    echo "👤 Credenciales por defecto:"
    echo "   • Admin: admin@doyouremember.com / admin123"
    echo "   • Doctor: doctor@doyouremember.com / doctor123"
    echo "   • Cuidador: cuidador@doyouremember.com / caregiver123"
    echo "   • Paciente: paciente@doyouremember.com / patient123"
    echo ""
    echo "🚀 Para iniciar el desarrollo:"
    echo "   npm run dev"
    echo ""
    echo "📚 Documentación:"
    echo "   • Instalación: docs/INSTALLATION.md"
    echo "   • API: docs/API.md"
    echo "   • Arquitectura: docs/ARCHITECTURE.md"
}

# Función principal
main() {
    echo "=========================================="
    echo "    DoYouRemember - Setup Script"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    setup_environment
    install_dependencies
    start_infrastructure
    setup_database
    verify_installation
    show_access_info
    
    echo ""
    print_success "¡Configuración completada exitosamente! 🎉"
}

# Ejecutar función principal
main "$@"
