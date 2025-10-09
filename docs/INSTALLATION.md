# Guía de Instalación - DoYouRemember

## Prerrequisitos

Antes de instalar DoYouRemember, asegúrate de tener instalado:

- **Docker** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior)
- **Node.js** (versión 18 o superior) - Solo para desarrollo
- **Git**

## Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone https://github.com/cafesaju/doyouremember.git
cd doyouremember
```

### 2. Configurar Variables de Entorno

```bash
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```bash
# Configuración General
NODE_ENV=development
PORT=3000

# Base de Datos
DATABASE_URL=postgresql://doyouremember:password@localhost:5432/doyouremember
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-cambiar-en-produccion
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Servicios Externos (opcional para desarrollo)
STT_NLP_SERVICE_URL=https://api.stt-nlp.com/v1
STT_NLP_API_KEY=tu-api-key
IDP_SSO_URL=https://auth.provider.com
NOTIFICATION_PROVIDER_URL=https://notifications.provider.com
```

### 3. Levantar el Sistema

#### Opción A: Desarrollo (Recomendado para empezar)

```bash
# Solo infraestructura (base de datos, redis, etc.)
docker-compose -f docker-compose.dev.yml up -d

# Instalar dependencias y ejecutar servicios
npm install
npm run dev
```

#### Opción B: Producción

```bash
# Construir y levantar todos los servicios
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Inicializar Base de Datos

```bash
# Ejecutar migraciones
npm run migrate

# Poblar con datos de ejemplo
npm run seed
```

### 5. Verificar Instalación

Abre tu navegador y visita:

- **Frontend**: http://localhost:3006
- **API Gateway**: http://localhost:3000
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

## Credenciales por Defecto

Después del seeding, puedes usar estas credenciales:

- **Administrador**: admin@doyouremember.com / admin123
- **Médico**: doctor@doyouremember.com / doctor123
- **Cuidador**: cuidador@doyouremember.com / caregiver123
- **Paciente**: paciente@doyouremember.com / patient123

## Estructura del Proyecto

```
DoYouRemember/
├── services/                 # Microservicios
│   ├── api-gateway/         # Punto de entrada único
│   ├── auth-service/        # Autenticación y autorización
│   ├── photo-service/       # Gestión de fotos
│   ├── analysis-service/    # Análisis NLP/STT
│   ├── report-service/      # Generación de reportes
│   └── notification-service/ # Notificaciones
├── frontend/                # Aplicación React
├── shared/                  # Código compartido
│   ├── types/              # Tipos TypeScript
│   ├── utils/              # Utilidades
│   └── middleware/         # Middleware compartido
├── infrastructure/          # Infraestructura
│   ├── database/           # Scripts de BD
│   ├── docker/             # Configuraciones Docker
│   └── monitoring/         # Monitoreo
└── docs/                   # Documentación
```

## Comandos Útiles

### Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar tests
npm test

# Linting
npm run lint
npm run lint:fix
```

### Base de Datos

```bash
# Ejecutar migraciones
npm run migrate

# Hacer rollback
npm run migrate:rollback

# Poblar con datos
npm run seed

# Resetear base de datos
npm run reset
```

### Docker

```bash
# Levantar servicios de desarrollo
docker-compose -f docker-compose.dev.yml up

# Levantar servicios de producción
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Reconstruir imágenes
docker-compose build
```

## Configuración de Servicios Externos

### STT/NLP Service

Para funcionalidad completa de transcripción y análisis:

1. Obtén una API key de un proveedor como:
   - Google Cloud Speech-to-Text
   - Azure Cognitive Services
   - AWS Transcribe

2. Configura las variables en `.env`:
```bash
STT_NLP_SERVICE_URL=https://api.tu-proveedor.com
STT_NLP_API_KEY=tu-api-key
STT_NLP_API_SECRET=tu-api-secret
```

### Notificaciones

Para notificaciones por email:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

Para notificaciones push:

```bash
FCM_SERVER_KEY=tu-fcm-server-key
FCM_PROJECT_ID=tu-fcm-project-id
```

## Solución de Problemas

### Error de Conexión a Base de Datos

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar servicios
docker-compose restart postgres
```

### Error de Permisos en Docker

```bash
# En Linux/Mac, ajustar permisos
sudo chown -R $USER:$USER .

# En Windows, ejecutar como administrador
```

### Puerto ya en Uso

```bash
# Verificar qué proceso usa el puerto
netstat -tulpn | grep :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Cambiar 3000 por 3001
```

### Problemas de Memoria

```bash
# Aumentar memoria de Docker
# En Docker Desktop: Settings > Resources > Memory
```

## Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f api-gateway
```

### Health Checks

```bash
# API Gateway
curl http://localhost:3000/health

# Servicios individuales
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Photo Service
curl http://localhost:3003/health  # Analysis Service
curl http://localhost:3004/health  # Report Service
curl http://localhost:3005/health  # Notification Service
```

## Próximos Pasos

1. **Configurar SSL/TLS** para producción
2. **Configurar backup automático** de base de datos
3. **Implementar CI/CD** con GitHub Actions
4. **Configurar monitoreo** con Prometheus/Grafana
5. **Optimizar rendimiento** según necesidades

## Soporte

Para soporte técnico:

- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación en `/docs`

## Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.
