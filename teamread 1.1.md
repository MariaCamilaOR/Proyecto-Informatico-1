# teamread 1.1

---

## Resumen en primera persona

Hice lo siguiente:
- Implementé un backend en Node + Express (TypeScript) que valida ID tokens de Firebase (admin SDK) y provee endpoints para manejar fotos: listar por paciente, crear metadata, y subir archivos (guardarlos en Cloud Storage y crear documentos en Firestore).
- Integré el frontend (Vite + React) para que use autenticación real de Firebase (Auth) y llame al backend con el token (Authorization: Bearer <idToken>), tanto para subir fotos como para listar las fotos guardadas.
- Añadí la inicialización correcta del SDK de administrador (firebase-admin) usando el service account local, y configuré el bucket de Storage.
- Resolví errores operativos: problemas de credenciales (causaban fallback a metadata y ENOTFOUND), falta de índice compuesto en Firestore (required index) y falta de storageBucket.
- Añadí un script para asignar custom claims (roles y linkedPatientIds) a un UID de Firebase para pruebas (`npm run set-claims`).

---

## Archivos modificados / añadidos (resumen)

/backend (Backend)
- `src/start.ts` — bootstrap que carga `.env.local` antes de arrancar el servidor.
- `src/firebaseAdmin.ts` — inicialización de firebase-admin desde el service account y configuración de `storageBucket`.
- `src/middleware/expressAuth.ts` — middleware que verifica ID tokens y extrae custom claims (role, linkedPatientIds).
- `src/routes/photos.ts` — endpoints: GET `/patient/:id`, POST `/` metadata, POST `/upload` (mulipart) y PUT `/:id`.
- `src/scripts/setClaims.ts` — script para asignar custom claims a un usuario (usa `.env.local`).
- `firestore.indexes.json` — se añadió el índice para `photos` (patientId ASC, createdAt DESC).
- `keys/` — aquí coloqué localmente el JSON del service account (NO subir al repo).
- `.env.local` — variables locales: `SERVICE_ACCOUNT_KEY_PATH`, `FIREBASE_STORAGE_BUCKET`, `PORT`, `SKIP_AUTH`.

/frontend (Frontend)
- `src/lib/api.ts` — instancia axios `api` con interceptor que añade Authorization con el ID token.
- `src/pages/Photos/Upload.tsx` — upload ahora usa `api.post('/photos/upload', form)` y recarga la galería.
- `src/pages/Photos/List.tsx` — ahora consulta `/api/photos/patient/:id` y muestra las fotos reales con `PhotoGallery`.
- `src/components/PhotoGallery/PhotoGallery.tsx` — añade link "Abrir imagen" para abrir la URL firmada (signed URL) en nueva pestaña (debug).
- `Frontend/.env` — variables `VITE_...` para la configuración cliente de Firebase y `VITE_API_BASE_URL`.



## Cómo arrancar el proyecto (PowerShell o la propia consola de VSC)

### 1) Backend
Desde la carpeta `Backend`:

```powershell
cd "C:\Users\Usuario\Documents\Universidad\Proyecto Informatico\Proyecto-Informatico-1\Backend"
npm install
npm run dev
```
- `npm run dev` ejecuta `ts-node-dev src/start.ts` (start carga `.env.local` antes).
- En la consola del backend deben aparecer mensajes como:
  - `[firebaseAdmin] loading service account from: ...`
  - `[firebaseAdmin] initializing admin SDK with service account, projectId= doyouremember-pi`
  - `[firebaseAdmin] using storage bucket: doyouremember-pi.firebasestorage.app`
  - `Server listening on port 3000`

### 2) Frontend
Desde la carpeta `Frontend`:

```powershell
cd "C:\Users\Usuario\Documents\Universidad\Proyecto Informatico\Proyecto-Informatico-1\Frontend"
npm install
npm run dev
```
- Abrir la URL que Vite indique (normalmente `http://localhost:5173`).

---

## Cómo probar el flujo básico (pasos fáciles)
1. Abrir la app en el navegador.
2. Login: iniciar sesión con un usuario creado en Firebase Auth (email/password) o crear uno nuevo.
3. Ir a **Photos > Upload** y subir una foto.
4. Verificar que la subida reporta éxito (201) y que en Firestore aparece el documento en la colección `photos` con `url`.
5. Ir a **Photos** (Galería) — las fotos (incluida la subida) deben mostrarse.
6. En Firebase Console puedes verificar:
   - Firestore > `photos` (documentos)
   - Storage > `photos/<patientId>/` (archivo subido)
   - Auth > Users (ver uid y custom claims si se aplicaron)

---

## Asignar roles / claims para pruebas
- Hay un script para poner custom claims (role y linkedPatientIds). Ejecutarlo desde `Backend`:

```powershell
cd "...\Backend"
# Reemplaza <UID> por el uid del usuario (lo ves en Firebase Console > Auth > Users)
npm run set-claims -- 8BvAYwNJeyTTy3EPSeH2CP1IDOn2 

Este es el de mi usuario, si añaden otro usuario toca cambiarle el UID (el numero ese grandote que hay ahi)
```
- El script lee `Backend/.env.local` para las variables y usa el service account para llamar a Admin SDK.

---

## Qué revisar en Firebase Console
- Firestore → Data → colección `photos`: ver documentos y campo `url`.
- Firestore → Indexes: comprobar que el índice `photos (patientId ASC, createdAt DESC)` está en estado **Ready**.
- Storage → Files: revisar `photos/<patientId>/` y probar descargar el archivo.
- Authentication → Users: comprobar usuario y claims.

---

## Notas sobre problemas que resolví (en palabras sencillas)
- 401 invalid_token: el servidor se inicializaba sin la credencial al arrancar; ahora `start.ts` carga `.env.local` antes de crear el app de Admin.
- ENOTFOUND metadata.google.internal: ocurría porque firebase-admin intentaba usar las credenciales GCP por defecto; al apuntar al JSON del service account se evita ese fallback.
- Índice Firestore: Firestore exige un índice compuesto para la consulta `where(patientId == X).orderBy(createdAt, 'desc')`. Añadí `firestore.indexes.json` y el índice se creó en la consola.
- Storage bucket: el bucket debe configurarse (variable `FIREBASE_STORAGE_BUCKET`) o pasar `storageBucket` a `initializeApp`.

---

## Comandos útiles (recordatorio rápido)
- Backend dev: `npm run dev` (en `Backend`).
- Frontend dev: `npm run dev` (en `Frontend`).
- Asignar claims: `npm run set-claims -- <UID>` (en `Backend`).

---

## Recomendaciones de seguridad
- NO subir el JSON del service account al repo.
- Usar variables de entorno seguras para producción (secret manager, Vercel/Netlify secrets, etc.).
- Limitar permisos del service account a lo mínimo necesario (Storage + Firestore + Auth si requiere).

---

## Estado actual y próximos pasos sugeridos
- Estado: backend y frontend funcionando en local; uploads guardan en Storage y creamos documentos en Firestore; galería muestra fotos.
- Siguientes pasos opcionales:
  - Añadir tests automatizados para endpoints.
  - Añadir paginación en listado de fotos.
  - Crear un pequeño admin panel para asignar roles sin usar el script `set-claims`.

---
