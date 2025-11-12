<div align="center">

# DoYouRemember 🧠

Aplicación web para apoyo a memoria (descripciones de fotos, quizzes y reportes) para pacientes con Alzheimer. Proyecto académico CAFESAJU (UAO).

**➡️ Inicio rápido (2 min) justo debajo.**
</div>

---

## 🚀 Inicio Rápido

### Opción A: Usar el Frontend Desplegado (requiere Backend local)

Frontend público: https://proyecto-pi-1-frontend.onrender.com/login

> Debido a un problema en el despliegue del backend (onrender) aún sin solución estable, el frontend desplegado necesita que corras el backend en tu máquina para funcionar correctamente. Si quieres acceder desde otra red/equipo, expón tu backend local con un túnel (ej. `ngrok`, `cloudflared`) y actualiza `runtime-config.js` en `Frontend/public/` con la URL pública.

adicionalmente, se necesita crear la ruta de Backend/keys utilizando los comandos abajo y colocar dentro el .json para poder cargar la base de datos (Este mismo va adjuntado al zip del proyecto que se entrego mediante el campus virtual)

```powershell
# Backend
cd Backend
mkdir keys
mv ../service-account.json keys/ #O arrastrarlo a la ruta despues de hacer el mkdir keys

```
Estructura necesaria para el backend local
Backend/
 ├── keys/
 │    └── service-account.json
 ├── src/
 ├── package.json
 └── ...

 
Pasos:
```powershell
# 1. Clonar el repo 
git clone [<repo-url>](https://github.com/MariaCamilaOR/Proyecto-Informatico-1)
cd Proyecto-Informatico-1

# 2. Iniciar Backend local
cd Backend
npm install
npm run dev
# Servirá en http://localhost:3000

# 3. Abrir el Frontend desplegado en el navegador
#    Inicia sesión / registra y el frontend hará peticiones a tu backend local.
```

Estructura del backend pa

Verifica salud del backend: http://localhost:3000/api/health → `{"ok": true}`

### Opción B: Ejecutar Todo Localmente


```powershell
# Backend
cd Backend
mkdir keys
mv ../service-account.json keys/ #O arrastrarlo a la ruta despues de hacer el mkdir keys


cd Backend
npm install
npm run dev

# En otra terminal
cd Frontend
npm install
npm run dev
```

URLs por defecto:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

---

## 🧱 Arquitectura General

| Capa      | Tech | Notas |
|-----------|------|-------|
| Backend   | Node.js 20 + Express + TypeScript | Endpoints REST bajo `/api/*` |
| Firebase  | Auth, Firestore, Storage | Roles y persistencia de fotos/descripciones |
| Frontend  | React 18 + Vite + Chakra UI | SPA con React Query para estado remoto |
| Observab. | (Opcional) Sentry | Errores y performance |

### Flujos Clave
1. **Descripción de Foto**: Cuidador/Paciente sube foto → se crea descripción (`/api/descriptions/wizard`) → se genera quiz (`/api/quizzes/generate`) → paciente responde → se calcula score → reportes agregados.
2. **Generación de Reporte**: Envío de quizzes (`/api/quizzes/:id/submit`) → agregación resumen → endpoint reportes (`/api/reports/summary/:patientId`) → vista médico.

---

## 📁 Estructura (Resumen)

```
Backend/
   src/
      middleware/        # auth y verificación de tokens
      routes/            # módulos Express: photos, reports, quizzes, etc.
      firebaseAdmin.ts   # inicialización Firebase Admin
   tests/               # unit & integration (Jest + Supertest)
Frontend/
   src/
      pages/             # vistas agrupadas por feature
      components/        # UI reutilizable
      hooks/             # lógica de datos (React Query)
      lib/               # api, auth, roles, tema, sentry
   public/runtime-config.js  # override dinámico de base URL
```

---

## 🔐 Roles y Permisos
- `PATIENT` – Acceso a sus fotos, quizzes y reportes.
- `CAREGIVER` – Puede ver y apoyar pacientes vinculados.
- `DOCTOR` – Vista analítica y reportes agregados.

La verificación se hace mediante Firebase ID Token + claims personalizados (middleware `verifyTokenMiddleware`).

---

## 🔧 Variables de Entorno

### Backend (`Backend/.env.local`)
Ejemplo mínimo:
```env
SERVICE_ACCOUNT_KEY_PATH=./keys/service-account.json
PORT=3000
FIREBASE_STORAGE_BUCKET=doyouremember-pi.firebasestorage.app
```

Alternativa: usar `SERVICE_ACCOUNT_KEY_JSON` con el contenido inline del service account. Mantén las claves fuera del repo.

### Frontend (`Frontend/.env.local`) (si decides no usar el runtime-config)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=... 
VITE_FIREBASE_AUTH_DOMAIN=... 
VITE_FIREBASE_PROJECT_ID=... 
VITE_FIREBASE_STORAGE_BUCKET=... 
VITE_FIREBASE_APP_ID=... 
```

El frontend desplegado utiliza `public/runtime-config.js` para inyectar `window.__VITE_API_BASE_URL`; puedes editarlo previo a build o despliegue.

### Buenas Prácticas
✅ Nunca subir `.env.local` al repositorio.  
✅ Proveer un `.env.sample` (pendiente, sugerido).  
✅ Rotar claves comprometidas inmediatamente. 

---

## 🛠️ Scripts Principales

### Backend
| Script | Propósito |
|--------|-----------|
| `npm run dev` | Desarrollo (ts-node-dev) |
| `npm run build` | Compila a `dist/` |
| `npm start` | Ejecuta build compilado |
| `npm test` | Pruebas Jest completas |
| `npm run test:unit` | Solo unit tests |
| `npm run test:integration` | Solo integración |
| `npm run bootstrap` | Ayuda a credenciales (PowerShell) |
| `npm run check-creds` | Verifica service account |

### Frontend
| Script | Propósito |
|--------|-----------|
| `npm run dev` | Servidor Vite dev |
| `npm run build` | Build producción |
| `npm run preview` | Sirve el build local |
| `npm test` | Unit + coverage |
| `npm run e2e` | Playwright tests |

---

## 🧪 Testing Rápido

```powershell
# Backend
cd Backend
npm test

# Frontend
cd Frontend
npm test
```

Para e2e (Playwright) asegúrate de tener browsers instalados: `npx playwright install`.

---

## 🩺 Endpoints Clave (Backend)
- `GET /api/health` – Ping.
- `GET /api/photos/patient/:id` – Fotos por paciente.
- `POST /api/descriptions/wizard` – Crear descripción + quiz.
- `POST /api/quizzes/generate` – Generar quiz desde descripción.
- `POST /api/quizzes/:id/submit` – Enviar respuestas.
- `GET /api/reports/summary/:patientId` – Reporte agregado.

Todos (excepto `/api/health` y onboarding de usuarios) requieren `Authorization: Bearer <token>`.

---

## 🧩 Flujo de Datos (Detalle)
```text
CAREGIVER/PATIENT -> Subir Foto -> Descripción (wizard) -> Generar Quiz -> Responder Quiz
-> Calcular Score -> Agregar a Reportes -> Doctor analiza métricas
```

Reportes agrupan métricas de: recall, coherencia, tendencias temporales.

---

## ⚠️ Problemas Conocidos y Workarounds
| Problema | Causa | Mitigación |
|----------|-------|------------|
| Backend desplegado falla | Error intermitente en onrender | Ejecutar backend local / usar túnel público |
| CORS bloquea peticiones desde frontend desplegado a backend local | Navegador no puede acceder a `localhost` desde hosting público | Usar túnel (ngrok) y poner URL pública en `runtime-config.js` |
| Port ocupado (3000) | Otro proceso activo | Cambiar `PORT` en `.env.local` y actualizar `VITE_API_BASE_URL` |
| Credenciales inválidas | Service account mal formateado | Usar `npm run check-creds` en Backend |

---

## 🔐 Seguridad Rápida
- Limita acceso al service account.
- Revisa reglas de Firestore (`firestore.rules`) y Storage (`storage.rules`) antes de prod.
- Añade monitoreo (Sentry) configurando `SENTRY_DSN` (pendiente en código según necesidad).

---

## 📦 Despliegue (Futuro / Referencia)
Backend ideal: migrar a Vercel Functions o Cloud Run con variables en panel.  
Frontend: Firebase Hosting → editar `public/runtime-config.js` antes del build si cambia la API.

### Pasos genéricos
```bash
# Backend
vercel --prod

# Frontend
npm run build
firebase deploy
```

---

## 👥 Contribuidores
- @MariaCamilaOR – Camila
- @Juan-Franco63 – Juan Pablo Franco Herrera
- @danielojedav19 – Daniel

---

## � Licencia
Uso académico para CAFESAJU (UAO). No redistribuir credenciales.

---

## ✅ Checklist de Verificación Rápida
- [ ] Backend corre y `GET /api/health` responde.
- [ ] Frontend muestra login.
- [ ] Claims / roles aplicados en endpoints protegidos.
- [ ] Reportes generados tras enviar quizzes.

Si algo falta o falla, abre Issue describiendo pasos para reproducir.

---

## 📝 Próximos Pasos Sugeridos
- Agregar `.env.sample` en ambos paquetes.
- Implementar subida firmada (signed URLs) para fotos.
- Añadir paginación en listados de fotos/quizzes.
- Integrar métricas de rendimiento (Web Vitals + Sentry performance).

---

¡Listo! Este README concentra el onboarding y operación del proyecto.
