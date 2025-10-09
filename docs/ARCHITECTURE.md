# Arquitectura del Sistema - DoYouRemember

## Visión General

DoYouRemember es un sistema de evaluación cognitiva basado en microservicios que permite a pacientes, cuidadores y médicos interactuar de manera segura y eficiente para monitorear el progreso cognitivo a través de actividades con fotografías familiares.

## Principios Arquitectónicos

### 1. Microservicios
- **Separación de responsabilidades**: Cada servicio tiene una función específica
- **Independencia**: Los servicios pueden desplegarse y escalarse independientemente
- **Tecnología diversa**: Cada servicio puede usar la tecnología más adecuada

### 2. API Gateway
- **Punto de entrada único**: Todas las peticiones pasan por el API Gateway
- **Enrutamiento**: Distribuye las peticiones a los microservicios correspondientes
- **Autenticación centralizada**: Maneja la autenticación y autorización
- **Rate limiting**: Controla el tráfico y previene abuso

### 3. Comunicación Asíncrona
- **Message Broker**: RabbitMQ para comunicación entre servicios
- **Eventos**: Los servicios publican y consumen eventos
- **Desacoplamiento**: Reduce las dependencias directas entre servicios

### 4. Seguridad
- **Cifrado en tránsito**: HTTPS/TLS para todas las comunicaciones
- **Cifrado en reposo**: AES-256 para datos sensibles
- **Autenticación JWT**: Tokens seguros con expiración
- **Autorización basada en roles**: Control de acceso granular

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTES                                 │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Paciente      │   Cuidador      │        Médico               │
│   (React App)   │   (React App)   │     (React App)             │
└─────────────────┴─────────────────┴─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX REVERSE PROXY                          │
│              (Load Balancing, SSL Termination)                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                │
│              (Routing, Auth, Rate Limiting)                     │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   AUTH      │    │   PHOTO     │    │  ANALYSIS   │
│  SERVICE    │    │  SERVICE    │    │  SERVICE    │
└─────────────┘    └─────────────┘    └─────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   REPORT    │    │NOTIFICATION │    │   SHARED    │
│  SERVICE    │    │  SERVICE    │    │  SERVICES   │
└─────────────┘    └─────────────┘    └─────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MESSAGE BROKER                               │
│                        (RabbitMQ)                               │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│POSTGRESQL   │    │    REDIS    │    │   MINIO     │
│(Transactional│    │   (Cache)   │    │(Object Store)│
│   Database) │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Microservicios

### 1. API Gateway
**Responsabilidades:**
- Enrutamiento de peticiones
- Autenticación y autorización
- Rate limiting
- Logging centralizado
- Circuit breaker

**Tecnologías:**
- Node.js + Express
- http-proxy-middleware
- JWT para autenticación

### 2. Auth Service
**Responsabilidades:**
- Gestión de usuarios
- Autenticación (login, registro)
- Autorización (roles y permisos)
- Gestión de tokens JWT
- 2FA (Two-Factor Authentication)
- Invitaciones

**Tecnologías:**
- Node.js + Express
- TypeORM + PostgreSQL
- bcrypt para hash de contraseñas
- JWT para tokens

### 3. Photo Service
**Responsabilidades:**
- Subida y gestión de fotos
- Procesamiento de imágenes
- Almacenamiento en MinIO
- Etiquetado de fotos
- Metadatos de fotos

**Tecnologías:**
- Node.js + Express
- Sharp para procesamiento de imágenes
- MinIO para almacenamiento
- Multer para upload de archivos

### 4. Analysis Service
**Responsabilidades:**
- Transcripción de audio (STT)
- Análisis de texto (NLP)
- Cálculo de métricas cognitivas
- Gestión de sesiones
- Integración con servicios externos

**Tecnologías:**
- Node.js + Express
- Integración con APIs externas de STT/NLP
- Algoritmos de análisis cognitivo

### 5. Report Service
**Responsabilidades:**
- Generación de reportes
- Exportación a PDF/CSV
- Comparación con línea base
- Histórico de métricas
- Alertas automáticas

**Tecnologías:**
- Node.js + Express
- Puppeteer para generación de PDF
- Algoritmos de comparación

### 6. Notification Service
**Responsabilidades:**
- Envío de notificaciones
- Recordatorios programados
- Notificaciones push
- Email notifications
- Gestión de preferencias

**Tecnologías:**
- Node.js + Express
- Nodemailer para email
- Firebase Cloud Messaging
- node-cron para tareas programadas

## Base de Datos

### PostgreSQL (Base de Datos Transaccional)
**Esquemas:**
- `users` - Información de usuarios
- `patients` - Datos específicos de pacientes
- `caregivers` - Datos de cuidadores
- `doctors` - Datos de médicos
- `photos` - Metadatos de fotos
- `photo_tags` - Etiquetas de fotos
- `cognitive_sessions` - Sesiones de evaluación
- `cognitive_metrics` - Métricas calculadas
- `reports` - Reportes generados
- `notifications` - Notificaciones
- `invitations` - Invitaciones entre usuarios

### Redis (Cache y Sesiones)
**Uso:**
- Cache de datos frecuentemente accedidos
- Almacenamiento de sesiones
- Rate limiting
- Colas de tareas

### MinIO (Almacenamiento de Objetos)
**Uso:**
- Almacenamiento de fotos
- Almacenamiento de archivos de audio
- Backup de archivos
- CDN para contenido estático

## Comunicación Entre Servicios

### Síncrona (HTTP/REST)
- API Gateway ↔ Microservicios
- Cliente ↔ API Gateway
- Servicios externos ↔ Microservicios

### Asíncrona (Message Broker)
**Eventos principales:**
- `photo.uploaded` - Foto subida
- `session.completed` - Sesión completada
- `analysis.completed` - Análisis completado
- `alert.triggered` - Alerta generada
- `report.generated` - Reporte generado

**Patrones:**
- **Event Sourcing**: Historial de eventos
- **CQRS**: Separación de comandos y consultas
- **Saga Pattern**: Transacciones distribuidas

## Seguridad

### Autenticación
- **JWT Tokens**: Access token (24h) + Refresh token (7d)
- **2FA**: Autenticación de dos factores con TOTP
- **Password Hashing**: bcrypt con salt rounds

### Autorización
- **RBAC**: Control de acceso basado en roles
- **Permisos granulares**: Por recurso y acción
- **Contexto de datos**: Acceso basado en relaciones

### Cifrado
- **En tránsito**: TLS 1.3
- **En reposo**: AES-256-GCM
- **Sensibles**: Cifrado adicional para datos médicos

### Validación
- **Input validation**: Joi schemas
- **SQL Injection**: TypeORM con prepared statements
- **XSS**: Sanitización de entrada
- **CSRF**: Tokens CSRF

## Escalabilidad

### Horizontal
- **Load Balancer**: Nginx para distribución de carga
- **Microservicios**: Escalado independiente
- **Base de datos**: Read replicas
- **Cache**: Redis cluster

### Vertical
- **Recursos**: CPU y memoria según demanda
- **Storage**: Almacenamiento escalable
- **Network**: Ancho de banda optimizado

## Monitoreo y Observabilidad

### Logging
- **Centralizado**: Winston + ELK Stack
- **Estructurado**: JSON logs
- **Correlación**: Request IDs
- **Niveles**: Error, Warn, Info, Debug

### Métricas
- **Prometheus**: Métricas de aplicación
- **Grafana**: Dashboards y alertas
- **Health Checks**: Estado de servicios
- **Performance**: Latencia y throughput

### Tracing
- **Distributed Tracing**: Jaeger
- **Request Flow**: Seguimiento de peticiones
- **Performance**: Identificación de cuellos de botella

## Despliegue

### Desarrollo
```bash
docker-compose -f docker-compose.dev.yml up
```

### Producción
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD
- **GitHub Actions**: Automatización
- **Testing**: Unit + Integration tests
- **Security**: SAST + Dependency scanning
- **Deployment**: Blue-green deployment

## Patrones de Diseño

### Circuit Breaker
- **Propósito**: Prevenir fallos en cascada
- **Implementación**: En API Gateway
- **Estados**: Closed, Open, Half-Open

### Retry Pattern
- **Propósito**: Manejar fallos temporales
- **Implementación**: Exponential backoff
- **Límites**: Máximo 3 reintentos

### Bulkhead Pattern
- **Propósito**: Aislar recursos
- **Implementación**: Pools de conexiones separados
- **Beneficio**: Prevenir propagación de fallos

### SAGA Pattern
- **Propósito**: Transacciones distribuidas
- **Implementación**: Event-driven
- **Compensación**: Rollback automático

## Consideraciones de Rendimiento

### Caching
- **Redis**: Cache de consultas frecuentes
- **CDN**: Contenido estático
- **Application Cache**: Datos en memoria

### Optimización de Base de Datos
- **Índices**: Optimización de consultas
- **Connection Pooling**: Reutilización de conexiones
- **Query Optimization**: Consultas eficientes

### Async Processing
- **Message Queues**: Procesamiento asíncrono
- **Background Jobs**: Tareas pesadas
- **Event Processing**: Procesamiento en tiempo real

## Consideraciones de Seguridad

### Compliance
- **HIPAA**: Protección de datos médicos
- **GDPR**: Privacidad de datos
- **SOC 2**: Controles de seguridad

### Backup y Recovery
- **Backup automático**: Base de datos
- **Point-in-time recovery**: Restauración
- **Disaster recovery**: Plan de contingencia

### Auditoría
- **Logs de auditoría**: Acciones de usuarios
- **Compliance reporting**: Reportes de cumplimiento
- **Data lineage**: Trazabilidad de datos

## Roadmap Técnico

### Fase 1 (Actual)
- ✅ Microservicios básicos
- ✅ API Gateway
- ✅ Autenticación JWT
- ✅ Base de datos PostgreSQL

### Fase 2 (Próxima)
- 🔄 Integración STT/NLP
- 🔄 Notificaciones push
- 🔄 Reportes avanzados
- 🔄 Monitoreo completo

### Fase 3 (Futuro)
- 📋 Machine Learning
- 📋 Análisis predictivo
- 📋 Integración IoT
- 📋 Mobile apps nativas
