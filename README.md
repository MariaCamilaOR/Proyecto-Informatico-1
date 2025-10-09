# DoYouRemember — CAFESAJU (UAO)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-%3E%3D20.10-blue)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

Sistema de **evaluación cognitiva** para detección temprana y monitoreo del Alzheimer a partir del análisis de descripciones de fotografías familiares.

**Arquitectura:** Microservicios con API Gateway  
**Curso:** Proyecto Informático (2025-3) — **Profesor:** Iván Mauricio Cabezas Troyano

---

## 👥 Equipo CAFESAJU
- **Daniel Ojeda Vega** - Arquitectura y Backend
- **Juan Pablo Franco Herrera** - Frontend y UI/UX  
- **Santiago Collantes Nieto** - Base de Datos y DevOps
- **Maria Camila Orozco Romero** - Análisis y Reportes
- **Luis Felipe Murillo Matallana** - Seguridad y Testing

---

## 🎯 Propósito del Sistema

DoYouRemember es una plataforma integral que permite:

### Para Pacientes
- 📸 Subir fotografías familiares con descripciones de referencia
- 🎤 Describir fotos mediante voz o texto
- 📊 Visualizar su progreso cognitivo a lo largo del tiempo
- 🔔 Recibir recordatorios no invasivos para actividades

### Para Cuidadores
- 👥 Gestionar múltiples pacientes
- 📈 Monitorear tendencias cognitivas
- 🚨 Recibir alertas de cambios significativos
- 📋 Acceder a reportes detallados

### Para Médicos
- 🏥 Establecer líneas base cognitivas
- 📊 Generar reportes médicos profesionales
- ⚠️ Configurar alertas personalizadas
- 📈 Analizar progresión de la enfermedad

### Métricas Cognitivas Evaluadas
- **Memory Recall** - Precisión en el recuerdo de hechos y entidades
- **Narrative Coherence** - Consistencia temática y secuencia lógica
- **Detail Accuracy** - Precisión en detalles específicos
- **Emotional Recognition** - Reconocimiento de emociones en las fotos
- **Temporal Accuracy** - Precisión temporal en los recuerdos

---

## 🏗️ Arquitectura del Sistema

### Microservicios Implementados

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTES                                 │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Paciente      │   Cuidador      │        Médico           │
│   (React App)   │   (React App)   │     (React App)         │
└─────────────────┴─────────────────┴─────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                              │
│              (Routing, Auth, Rate Limiting)                 │
└─────────────────────────────────────────────────────────────┘
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
```

### Servicios Desarrollados

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **API Gateway** | 3000 | Punto de entrada único, autenticación, rate limiting |
| **Auth Service** | 3001 | Gestión de usuarios, JWT, 2FA, invitaciones |
| **Photo Service** | 3002 | Subida y gestión de fotos, procesamiento de imágenes |
| **Analysis Service** | 3003 | STT, NLP, cálculo de métricas cognitivas |
| **Report Service** | 3004 | Generación de reportes, exportación PDF/CSV |
| **Notification Service** | 3005 | Notificaciones, recordatorios, alertas |

### Infraestructura

- **Base de Datos:** PostgreSQL 15 con esquema completo
- **Cache:** Redis 7 para sesiones y caché
- **Message Broker:** RabbitMQ para comunicación asíncrona
- **Almacenamiento:** MinIO para archivos multimedia
- **Reverse Proxy:** Nginx con load balancing
- **Frontend:** React 18 con Material-UI

---

## 📑 Documentación Completa

### Documentación Técnica
- 📖 **[Guía de Instalación](docs/INSTALLATION.md)** - Configuración paso a paso
- 🔌 **[Documentación de API](docs/API.md)** - Endpoints y ejemplos
- 🏗️ **[Arquitectura del Sistema](docs/ARCHITECTURE.md)** - Diseño detallado
- 📋 **[Changelog](CHANGELOG.md)** - Historial de cambios

### Diagramas y Especificaciones
- **Diagramas C4** → [Contexto y Contenedores](https://www.rapidcharts.ai/editor/74d1cae3-1738-43c3-8134-046daa184d47/View)
- **Diagramas UML** → [Especificaciones de diseño](docs/ARCHITECTURE.md)
- **Informe Técnico** → [Documento completo del proyecto](https://uao-my.sharepoint.com/:w:/g/personal/maria_cam_orozco_uao_edu_co/ESOyNBjM1AtBvD_HAi7yajkB9N5RzVdCMINbTpjee2A2Og?e=gUAHyH)

---

## ✅ Atributos de Calidad Implementados

| Atributo | Objetivo | Implementación | Métrica |
|----------|----------|----------------|---------|
| **Disponibilidad** | Evitar caída total | Circuit breaker, health checks | 99.9% uptime |
| **Rendimiento** | Respuesta rápida | Cache Redis, optimización DB | <2s UI, <500ms API |
| **Seguridad** | Datos protegidos | JWT, HTTPS, cifrado AES-256 | TLS 1.3, OWASP Top 10 |
| **Escalabilidad** | Crecimiento horizontal | Microservicios, Docker | Auto-scaling |
| **Modificabilidad** | Cambios independientes | Despliegue por servicio | CI/CD por servicio |
| **Testabilidad** | Cobertura completa | Unit, Integration, E2E | >80% cobertura |

---

## 🧪 Estrategia de Testing

### Tipos de Pruebas Implementadas
- **Unitarias** - Por servicio con Jest
- **Integración** - Entre servicios con Docker Compose
- **Contratos** - API con Pact
- **End-to-End** - Flujo completo usuario → reporte
- **Performance** - Carga y estrés con Artillery

### Cobertura de Código
```bash
npm run test:coverage  # Ejecutar todas las pruebas con cobertura
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Docker** 20.10+ y **Docker Compose** 2.0+
- **Node.js** 18+ (para desarrollo)
- **Git**

### Instalación Rápida (Recomendada)

```bash
# 1. Clonar el repositorio
git clone https://github.com/MariaCamilaOR/Proyecto-Informatico-1.git
cd Proyecto-Informatico-1

# 2. Ejecutar script de configuración automática
# En Windows:
.\scripts\setup.ps1

# En Linux/Mac:
./scripts/setup.sh
```

### Instalación Manual

```bash
# 1. Clonar el repositorio
git clone https://github.com/MariaCamilaOR/Proyecto-Informatico-1.git
cd Proyecto-Informatico-1

# 2. Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# 3. Levantar infraestructura
docker-compose -f docker-compose.dev.yml up -d

# 4. Instalar dependencias (desarrollo)
npm install

# 5. Configurar base de datos
npm run migrate
npm run seed

# 6. Iniciar desarrollo
npm run dev
```

### Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar todos los servicios
npm run dev:gateway           # Solo API Gateway
npm run dev:frontend          # Solo Frontend

# Base de datos
npm run migrate               # Ejecutar migraciones
npm run seed                  # Poblar con datos de ejemplo
npm run migrate:rollback      # Rollback de migraciones

# Docker
npm run docker:dev            # Levantar entorno de desarrollo
npm run docker:prod           # Levantar entorno de producción
npm run docker:logs           # Ver logs de todos los servicios

# Testing
npm test                      # Ejecutar todas las pruebas
npm run test:coverage         # Pruebas con cobertura
npm run test:integration      # Pruebas de integración

# Linting
npm run lint                  # Verificar código
npm run lint:fix              # Corregir automáticamente
```

---

## 🌐 Acceso al Sistema

### URLs de Desarrollo
- **Frontend:** http://localhost:3006
- **API Gateway:** http://localhost:3000
- **RabbitMQ Management:** http://localhost:15672 (guest/guest)
- **MinIO Console:** http://localhost:9001 (minioadmin/minioadmin)

### Credenciales de Prueba
| Rol | Email | Contraseña |
|-----|-------|------------|
| **Administrador** | admin@doyouremember.com | admin123 |
| **Médico** | doctor@doyouremember.com | doctor123 |
| **Cuidador** | cuidador@doyouremember.com | caregiver123 |
| **Paciente** | paciente@doyouremember.com | patient123 |

---

## 📊 Historias de Usuario Implementadas

### Prioridad 1 (Completadas ✅)
- **HU-1.1** - Subir fotografías familiares
- **HU-1.2** - Proporcionar descripción de referencia
- **HU-2.1** - Visualizar fotos familiares subidas
- **HU-2.2** - Describir fotos familiares
- **HU-3** - Garantizar seguridad de datos
- **HU-4.1** - Ver informe de línea base del paciente
- **HU-4.2** - Recibir alertas de desviaciones significativas
- **HU-5** - Visualizar informe simple del desempeño
- **HU-6** - Recibir recordatorios no invasivos
- **HU-7** - Etiquetar entidades clave en la foto
- **HU-8** - Grabar descripción por voz con transcripción
- **HU-9** - Asistente de onboarding para primera línea base
- **HU-10** - Vincular cuenta del cuidador con la del paciente

### Prioridad 2 (Completadas ✅)
- **HU-11.1** - Filtrar informes por rango de fechas
- **HU-11.2** - Filtrar informes por métricas
- **HU-12** - Profundizar del trend al detalle por sesión/foto
- **HU-13.1** - Configurar umbrales de alerta
- **HU-13.2** - Frecuencia de alertas
- **HU-14** - Recalibrar línea base preservando histórico

---

## 🔧 Tecnologías Utilizadas

### Backend
- **Node.js** 18+ con **TypeScript** 5.3
- **Express.js** para APIs REST
- **TypeORM** para base de datos
- **JWT** para autenticación
- **bcrypt** para hash de contraseñas
- **Multer** para upload de archivos

### Frontend
- **React** 18 con **TypeScript**
- **Material-UI** para componentes
- **React Router** para navegación
- **Zustand** para estado global
- **React Query** para gestión de datos
- **Recharts** para gráficos

### Infraestructura
- **Docker** y **Docker Compose**
- **PostgreSQL** 15 para datos transaccionales
- **Redis** 7 para caché y sesiones
- **RabbitMQ** para mensajería
- **MinIO** para almacenamiento de objetos
- **Nginx** como reverse proxy

### DevOps y Testing
- **Jest** para testing
- **ESLint** para linting
- **Winston** para logging
- **Helmet** para seguridad
- **Morgan** para logging HTTP

---

## 📈 Roadmap del Proyecto

### Fase 1 (Completada ✅)
- ✅ Arquitectura de microservicios
- ✅ API Gateway y autenticación
- ✅ Gestión de fotos y análisis
- ✅ Sistema de reportes
- ✅ Frontend React completo

### Fase 2 (En Desarrollo 🔄)
- 🔄 Integración con servicios STT/NLP externos
- 🔄 Notificaciones push avanzadas
- 🔄 Reportes médicos profesionales
- 🔄 Monitoreo y observabilidad

### Fase 3 (Planificada 📋)
- 📋 Machine Learning para análisis predictivo
- 📋 Aplicaciones móviles nativas
- 📋 Integración con dispositivos IoT
- 📋 Análisis de big data

---

## 🤝 Contribución

### Cómo Contribuir
1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request **hacia la rama `develop`** (NO hacia main/master)

> ⚠️ **IMPORTANTE**: Todos los Pull Requests deben dirigirse a la rama `develop`, no a `main` o `master`.

### Estándares de Código
- Seguir las convenciones de TypeScript
- Escribir tests para nuevas funcionalidades
- Documentar APIs y funciones complejas
- Usar commits semánticos

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Soporte y Contacto

### Equipo de Desarrollo
- **Email:** cafesaju@uao.edu.co
- **GitHub:** [@MariaCamilaOR](https://github.com/MariaCamilaOR)
- **Issues:** [GitHub Issues](https://github.com/MariaCamilaOR/Proyecto-Informatico-1/issues)

### Documentación Adicional
- 📖 [Guía de Instalación](docs/INSTALLATION.md)
- 🔌 [Documentación de API](docs/API.md)
- 🏗️ [Arquitectura del Sistema](docs/ARCHITECTURE.md)

---

## 🙏 Agradecimientos

- **Profesor Iván Mauricio Cabezas Troyano** por la guía y supervisión
- **Universidad Autónoma de Occidente** por el apoyo académico
- **Comunidad de desarrolladores** por las herramientas open source utilizadas

---

<div align="center">

**Desarrollado con ❤️ por el equipo CAFESAJU**

*Proyecto Informático 2025-3 - Universidad Autónoma de Occidente*

</div>