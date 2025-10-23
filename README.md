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

### Backend (.env)
```env
GOOGLE_APPLICATION_CREDENTIALS_JSON={...}
FIREBASE_PROJECT_ID=dyr-project
FIREBASE_STORAGE_BUCKET=dyr-project.appspot.com
ALLOWED_ORIGINS=http://localhost:5173
SENTRY_DSN=
STT_PROVIDER_API_KEY=
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=
VITE_SENTRY_DSN=
```

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
