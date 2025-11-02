# DoYouRemember 🧠

**Aplicación web para detección temprana y monitoreo del Alzheimer a partir de descripciones de fotos**

Proyecto desarrollado para CAFESAJU (UAO) con arquitectura de microservicios.

## 🏗️ Arquitectura

### Backend (Serverless)
- **Runtime**: Node.js 20 LTS + TypeScript
- **Plataforma**: Vercel Functions
- **Base de datos**: Firebase Firestore (NoSQL)
- **Autenticación**: Firebase Auth con roles
- **Almacenamiento**: Firebase Storage
- **Tareas programadas**: Vercel Cron

### Frontend (SPA)
- **Framework**: React 18 + Vite + TypeScript
- **UI**: Chakra UI
- **Routing**: React Router 6
- **Estado**: TanStack React Query
- **Despliegue**: Firebase Hosting

## 🚀 Instalación y Configuración

### Backend

```bash
cd Backend
npm install
cp .env.sample .env
# Configurar variables de entorno en .env
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
cp .env.sample .env
# Configurar variables de entorno en .env
npm run dev
```

## 📋 Funcionalidades

### Para Pacientes
- Subir fotos personales
- Describir fotos por texto o voz
- Ver reportes de progreso
- Recibir recordatorios

### Para Cuidadores
- Monitorear pacientes vinculados
- Ver alertas y tendencias
- Configurar notificaciones

### Para Doctores
- Generar reportes detallados
- Analizar métricas de recall y coherencia
- Configurar políticas de alerta

## 🔐 Roles y Permisos

- **Patient**: Propietario de sus datos
- **Caregiver**: Acceso a pacientes vinculados
- **Doctor**: Acceso completo para análisis

## 📊 Métricas Analizadas

- **Recall**: Capacidad de recordar detalles
- **Coherencia**: Consistencia en las descripciones
- **Tendencias**: Evolución temporal de las métricas

## 🛠️ Desarrollo

### Scripts disponibles

**Backend:**
- `npm run dev` - Desarrollo local con Vercel
- `npm run build` - Compilar TypeScript
- `npm run test` - Ejecutar pruebas
- `npm run lint` - Linter

**Frontend:**
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run test` - Pruebas unitarias
- `npm run e2e` - Pruebas end-to-end

## 📁 Estructura del Proyecto

```
DoURemember/
├── Backend/                 # API Serverless
│   ├── api/                # Endpoints Vercel
│   ├── src/                # Código fuente
│   │   ├── config/         # Configuración Firebase
│   │   ├── middleware/     # Autenticación
│   │   ├── lib/           # Librerías internas
│   │   ├── routes/        # Handlers de rutas
│   │   └── types/         # Tipos TypeScript
│   ├── tests/             # Pruebas
│   └── vercel.json        # Configuración Vercel
├── Frontend/               # SPA React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── lib/          # Configuración y utilidades
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── types/        # Tipos TypeScript
│   │   └── styles/       # Estilos globales
│   └── firebase.json     # Configuración Firebase Hosting
└── README.md
```

## 🔧 Variables de Entorno

### Configuración Inicial

1. **Copiar los archivos de ejemplo:**
   ```bash
   # Backend
   cd Backend
   cp .env.sample .env
   
   # Frontend
   cd Frontend
   cp .env.sample .env
   ```

2. **Editar los archivos `.env`** con tus valores reales (nunca commitees estos archivos).

### Backend (.env)

```env
# Firebase - Credenciales de servicio (JSON completo como string)
# 1. Ve a Firebase Console > Project Settings > Service Accounts
# 2. Genera una nueva clave privada
# 3. Convierte el JSON completo a una cadena de una sola línea (sin saltos de línea)
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# Firebase - Información del proyecto
FIREBASE_PROJECT_ID=dyr-project
FIREBASE_STORAGE_BUCKET=dyr-project.appspot.com

# CORS - Orígenes permitidos (separados por coma si hay múltiples)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Sentry - Monitoreo de errores (opcional)
SENTRY_DSN=https://...

# STT Provider - API Key para transcripción de voz (opcional)
STT_PROVIDER_API_KEY=tu-api-key-aqui
```

**⚠️ Importante:** 
- En Vercel (producción), configura estas variables en el dashboard: Settings > Environment Variables
- El archivo `.env` solo se usa para desarrollo local

### Frontend (.env)

```env
# API Backend - URL base de la API
# Desarrollo: http://localhost:3000/api
# Producción: https://tu-backend.vercel.app/api
VITE_API_BASE_URL=http://localhost:3000/api

# Firebase - Configuración del proyecto
# Obtén estos valores desde Firebase Console > Project Settings > General > Your apps > Web app
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry - Monitoreo de errores (opcional)
VITE_SENTRY_DSN=https://...
```

**⚠️ Importante:** 
- En Vite, todas las variables deben tener el prefijo `VITE_` para ser expuestas al cliente
- El archivo `.env` solo se usa para desarrollo local
- En producción (Firebase Hosting), configura estas variables en el dashboard de Firebase o durante el build

### Seguridad

✅ **Hacer:**
- Mantener `.env` en `.gitignore` (ya configurado)
- Usar `.env.sample` como plantilla para otros desarrolladores
- Configurar variables en el dashboard de Vercel/Firebase para producción

❌ **No hacer:**
- Committear archivos `.env` al repositorio
- Exponer API keys en el código fuente
- Compartir credenciales por email o chat

## 🚀 Despliegue

### Backend (Vercel)
```bash
cd Backend
vercel --prod
```

### Frontend (Firebase Hosting)
```bash
cd Frontend
npm run build
firebase deploy
```

## 📝 Licencia

Proyecto académico para CAFESAJU (UAO)

## 👥 Contribuidores

- @MariaCamilaOR - Camila
- @Juan-Franco63 - Juan Pablo Franco Herrera  
- @danielojedav19 - Daniel
