# 🚀 Cómo Ejecutar el Proyecto DoURemember

## 📋 Requisitos Previos

✅ Node.js instalado (versión 18 o superior)  
✅ npm instalado  
✅ Archivos `.env.local` configurados con tus credenciales de Firebase

---

## 🔧 Paso 1: Instalar Dependencias

### Backend
```powershell
cd Backend
npm install
```

### Frontend
```powershell
cd Frontend
npm install
```

---

## 🎯 Paso 2: Configurar Variables de Entorno

### Backend (`.env.local`)
Abre `Backend/.env.local` y completa:
```env
SERVICE_ACCOUNT_KEY_JSON={"type":"service_account",...}  # O usa SERVICE_ACCOUNT_KEY_PATH
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
PORT=3000
```

### Frontend (`.env.local`)
Abre `Frontend/.env.local` y completa:
```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_APP_ID=tu-app-id
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 🏃 Paso 3: Ejecutar el Proyecto

### Opción A: Terminal Separadas (Recomendado)

**Terminal 1 - Backend:**
```powershell
cd Backend
npm run dev
```
El servidor correrá en: `http://localhost:3000`

**Terminal 2 - Frontend:**
```powershell
cd Frontend
npm run dev
```
La aplicación correrá en: `http://localhost:5173`

---

### Opción B: Ejecutar en Background (PowerShell)

**Backend:**
```powershell
cd Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
```

**Frontend:**
```powershell
cd Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
```

---

## ✅ Verificar que Todo Funciona

1. **Backend:**
   - Abre: http://localhost:3000/api/health
   - Debe responder: `{"ok": true}`

2. **Frontend:**
   - Abre: http://localhost:5173
   - Debe mostrar la aplicación React

---

## 🛑 Detener los Servidores

Presiona `Ctrl + C` en cada terminal donde esté corriendo un servidor.

---

## 📝 Scripts Disponibles

### Backend
- `npm run dev` - Servidor de desarrollo (Express)
- `npm run build` - Compilar TypeScript
- `npm run start` - Ejecutar versión compilada
- `npm run check-creds` - Verificar credenciales de Firebase

### Frontend
- `npm run dev` - Servidor de desarrollo (Vite)
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run test` - Ejecutar pruebas

---

## ⚠️ Solución de Problemas

### Error: "Cannot find module"
```powershell
# Reinstalar dependencias
cd Backend
Remove-Item -Recurse -Force node_modules
npm install

cd ..\Frontend
Remove-Item -Recurse -Force node_modules
npm install
```

### Error: "Port already in use"
```powershell
# Cambiar el puerto en .env.local
PORT=3001  # Para Backend
```

### Error: Firebase no se conecta
- Verifica que las credenciales en `.env.local` sean correctas
- Ejecuta: `cd Backend && npm run check-creds`

