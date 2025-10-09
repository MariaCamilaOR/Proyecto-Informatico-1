# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Agregado
- **Sistema de Autenticación**
  - Login y registro de usuarios
  - Autenticación JWT con refresh tokens
  - Autenticación de dos factores (2FA)
  - Gestión de roles (Paciente, Cuidador, Médico, Admin)
  - Sistema de invitaciones entre usuarios

- **Gestión de Fotos**
  - Subida de fotografías familiares
  - Procesamiento y optimización de imágenes
  - Etiquetado de entidades en fotos (personas, objetos, lugares)
  - Almacenamiento seguro con cifrado
  - Metadatos y descripciones de referencia

- **Análisis Cognitivo**
  - Transcripción de audio a texto (STT)
  - Análisis de lenguaje natural (NLP)
  - Cálculo de métricas cognitivas:
    - Memory Recall (Recuerdo de memoria)
    - Narrative Coherence (Coherencia narrativa)
    - Detail Accuracy (Precisión de detalles)
    - Emotional Recognition (Reconocimiento emocional)
    - Temporal Accuracy (Precisión temporal)
  - Gestión de sesiones de evaluación

- **Sistema de Reportes**
  - Generación de reportes de línea base
  - Reportes de progreso en el tiempo
  - Comparación con línea base
  - Exportación a PDF y CSV
  - Alertas de desviaciones significativas

- **Notificaciones**
  - Recordatorios no invasivos
  - Notificaciones push
  - Notificaciones por email
  - Configuración de preferencias
  - Tareas programadas

- **API Gateway**
  - Punto de entrada único
  - Enrutamiento de peticiones
  - Rate limiting
  - Circuit breaker
  - Logging centralizado

- **Frontend React**
  - Interfaz para pacientes
  - Interfaz para cuidadores
  - Interfaz para médicos
  - Dashboard interactivo
  - Gestión de perfil de usuario

- **Infraestructura**
  - Arquitectura de microservicios
  - Docker y Docker Compose
  - Base de datos PostgreSQL
  - Cache Redis
  - Message broker RabbitMQ
  - Almacenamiento de objetos MinIO
  - Nginx como reverse proxy

### Implementado
- **Historias de Usuario Prioridad 1**
  - HU-1.1: Subir fotografías familiares
  - HU-1.2: Proporcionar descripción de referencia
  - HU-2.1: Visualizar fotos familiares subidas
  - HU-2.2: Describir fotos familiares
  - HU-3: Garantizar seguridad de datos
  - HU-4.1: Ver informe de línea base del paciente
  - HU-4.2: Recibir alertas de desviaciones significativas
  - HU-5: Visualizar informe simple del desempeño
  - HU-6: Recibir recordatorios no invasivos
  - HU-7: Etiquetar entidades clave en la foto
  - HU-8: Grabar descripción por voz con transcripción
  - HU-9: Asistente de onboarding para primera línea base
  - HU-10: Vincular cuenta del cuidador con la del paciente

- **Historias de Usuario Prioridad 2**
  - HU-11.1: Filtrar informes por rango de fechas
  - HU-11.2: Filtrar informes por métricas
  - HU-12: Profundizar del trend al detalle por sesión/foto
  - HU-13.1: Configurar umbrales de alerta
  - HU-13.2: Frecuencia de alertas
  - HU-14: Recalibrar línea base preservando histórico

### Seguridad
- Cifrado en tránsito (HTTPS/TLS)
- Cifrado en reposo (AES-256)
- Autenticación JWT segura
- Validación de entrada
- Sanitización de datos
- Control de acceso basado en roles
- Rate limiting
- Logs de auditoría

### Documentación
- README completo con instrucciones de instalación
- Documentación de API
- Documentación de arquitectura
- Guía de instalación
- Ejemplos de uso
- Diagramas C4 (Contexto y Contenedores)

### Testing
- Estructura de testing configurada
- Tests unitarios básicos
- Tests de integración
- Configuración de cobertura de código

### DevOps
- Docker Compose para desarrollo y producción
- Scripts de migración de base de datos
- Scripts de seeding con datos de ejemplo
- Configuración de Nginx
- Health checks para todos los servicios

## [0.1.0] - 2024-01-01

### Agregado
- Estructura inicial del proyecto
- Configuración básica de microservicios
- Esquema de base de datos inicial
- Configuración de Docker
- Documentación básica

---

## Tipos de Cambios

- **Agregado** para nuevas funcionalidades
- **Cambiado** para cambios en funcionalidades existentes
- **Deprecado** para funcionalidades que serán eliminadas
- **Eliminado** para funcionalidades eliminadas
- **Corregido** para corrección de bugs
- **Seguridad** para vulnerabilidades de seguridad
