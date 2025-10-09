# Documentación de API - DoYouRemember

## Información General

La API de DoYouRemember está construida con una arquitectura de microservicios y utiliza un API Gateway como punto de entrada único.

- **Base URL**: `http://localhost:3000/api`
- **Autenticación**: JWT Bearer Token
- **Formato**: JSON
- **Versión**: 1.0.0

## Autenticación

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "twoFactorCode": "123456" // Opcional
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "patient"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": 86400,
      "tokenType": "Bearer"
    }
  }
}
```

### Registro

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña123",
  "firstName": "María",
  "lastName": "González",
  "role": "patient",
  "dateOfBirth": "1950-05-15",
  "medicalRecordNumber": "MRN123"
}
```

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}
```

## Gestión de Fotos

### Subir Foto

```http
POST /api/photo/photos
Authorization: Bearer {token}
Content-Type: multipart/form-data

photo: [archivo de imagen]
patientId: "uuid"
description: "Descripción de la foto"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "photo": {
      "id": "uuid",
      "patientId": "uuid",
      "filename": "foto.jpg",
      "url": "https://storage.com/foto.jpg",
      "description": "Descripción de la foto",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Obtener Fotos del Paciente

```http
GET /api/photo/photos/patient/{patientId}
Authorization: Bearer {token}
```

### Agregar Etiqueta a Foto

```http
POST /api/photo/photos/{photoId}/tags
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "person",
  "label": "Juan Pérez",
  "x": 0.5,
  "y": 0.3,
  "width": 0.2,
  "height": 0.4
}
```

## Análisis Cognitivo

### Crear Sesión

```http
POST /api/analysis/sessions
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": "uuid",
  "type": "assessment"
}
```

### Transcribir Audio

```http
POST /api/analysis/transcribe
Authorization: Bearer {token}
Content-Type: multipart/form-data

audio: [archivo de audio]
sessionId: "uuid"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "transcription": {
      "id": "uuid",
      "sessionId": "uuid",
      "text": "Transcripción del audio...",
      "confidence": 0.95,
      "language": "es",
      "duration": 30.5
    }
  }
}
```

### Analizar Texto

```http
POST /api/analysis/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Descripción del paciente...",
  "referenceText": "Texto de referencia...",
  "sessionId": "uuid"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "id": "uuid",
      "sessionId": "uuid",
      "text": "Descripción del paciente...",
      "metrics": {
        "memoryRecall": 85,
        "narrativeCoherence": 78,
        "detailAccuracy": 82,
        "emotionalRecognition": 75,
        "temporalAccuracy": 80
      }
    }
  }
}
```

## Reportes

### Generar Reporte

```http
POST /api/report/reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": "uuid",
  "type": "progress",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### Obtener Reporte

```http
GET /api/report/reports/{reportId}
Authorization: Bearer {token}
```

### Descargar PDF

```http
GET /api/report/reports/{reportId}/pdf
Authorization: Bearer {token}
```

### Exportar Reporte

```http
GET /api/report/reports/{reportId}/export?format=csv
Authorization: Bearer {token}
```

## Notificaciones

### Crear Notificación

```http
POST /api/notification/notifications
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "uuid",
  "type": "reminder",
  "title": "Recordatorio de actividad",
  "message": "Es hora de realizar una actividad",
  "scheduledFor": "2024-01-01T10:00:00Z"
}
```

### Obtener Notificaciones

```http
GET /api/notification/notifications?page=1&limit=10&isRead=false
Authorization: Bearer {token}
```

### Marcar como Leída

```http
PUT /api/notification/notifications/{notificationId}/read
Authorization: Bearer {token}
```

## Gestión de Usuarios

### Obtener Perfil

```http
GET /api/auth/users/profile
Authorization: Bearer {token}
```

### Actualizar Perfil

```http
PUT /api/auth/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Nuevo Nombre",
  "lastName": "Nuevo Apellido"
}
```

### Cambiar Contraseña

```http
PUT /api/auth/users/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "contraseña-actual",
  "newPassword": "nueva-contraseña"
}
```

## Invitaciones

### Crear Invitación

```http
POST /api/auth/invitations
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientEmail": "paciente@ejemplo.com"
}
```

### Aceptar Invitación

```http
POST /api/auth/invitations/{code}/accept
Content-Type: application/json

{
  "patientId": "uuid" // Si el paciente ya existe
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos de entrada inválidos |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - Permisos insuficientes |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto con el estado actual |
| 422 | Unprocessable Entity - Error de validación |
| 429 | Too Many Requests - Límite de velocidad excedido |
| 500 | Internal Server Error - Error interno del servidor |
| 503 | Service Unavailable - Servicio no disponible |

## Ejemplos de Respuestas de Error

### Error de Validación

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email inválido",
    "details": {
      "field": "email",
      "value": "email-invalido"
    }
  }
}
```

### Error de Autenticación

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token de acceso requerido"
  }
}
```

### Error de Permisos

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Permisos insuficientes"
  }
}
```

## Rate Limiting

La API implementa rate limiting para prevenir abuso:

- **Autenticación**: 5 requests por 15 minutos
- **API General**: 100 requests por 15 minutos
- **Subida de archivos**: 10 requests por 15 minutos

Los headers de respuesta incluyen información sobre el rate limiting:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Paginación

Los endpoints que devuelven listas soportan paginación:

```http
GET /api/photo/photos/patient/{patientId}?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "photos": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

## Webhooks

Para notificaciones en tiempo real, la API soporta webhooks:

### Configurar Webhook

```http
POST /api/notifications/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://tu-servidor.com/webhook",
  "events": ["photo.uploaded", "session.completed"],
  "secret": "webhook-secret"
}
```

### Eventos Disponibles

- `photo.uploaded` - Foto subida
- `session.completed` - Sesión completada
- `alert.triggered` - Alerta generada
- `report.generated` - Reporte generado

## SDKs y Librerías

### JavaScript/TypeScript

```bash
npm install doyouremember-sdk
```

```javascript
import { DoYouRememberClient } from 'doyouremember-sdk';

const client = new DoYouRememberClient({
  baseUrl: 'http://localhost:3000/api',
  apiKey: 'your-api-key'
});

// Login
const user = await client.auth.login('email', 'password');

// Subir foto
const photo = await client.photos.upload(file, {
  patientId: 'uuid',
  description: 'Descripción'
});
```

### Python

```bash
pip install doyouremember-python
```

```python
from doyouremember import DoYouRememberClient

client = DoYouRememberClient(
    base_url='http://localhost:3000/api',
    api_key='your-api-key'
)

# Login
user = client.auth.login('email', 'password')

# Subir foto
photo = client.photos.upload(file, patient_id='uuid', description='Descripción')
```

## Testing

### Postman Collection

Descarga la colección de Postman desde: `/docs/postman/DoYouRemember-API.postman_collection.json`

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","password":"contraseña123"}'

# Obtener fotos
curl -X GET http://localhost:3000/api/photo/photos/patient/uuid \
  -H "Authorization: Bearer your-token"

# Subir foto
curl -X POST http://localhost:3000/api/photo/photos \
  -H "Authorization: Bearer your-token" \
  -F "photo=@foto.jpg" \
  -F "patientId=uuid" \
  -F "description=Descripción de la foto"
```

## Changelog

### v1.0.0 (2024-01-01)
- Lanzamiento inicial
- Autenticación JWT
- Gestión de fotos
- Análisis cognitivo
- Generación de reportes
- Sistema de notificaciones