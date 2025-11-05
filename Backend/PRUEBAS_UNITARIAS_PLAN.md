# 🧪 Plan de Pruebas Unitarias Backend - DoYouRemember

## 📋 Pruebas que PODEMOS hacer con lo que hay actualmente

### ✅ **1. Middleware de Autenticación** (`expressAuth.ts`) - PRIORIDAD ALTA

**¿Por qué es crítico?** Es la primera línea de seguridad. Todos los endpoints protegidos dependen de esto.

**Qué probar:**
- ✅ Token válido con claims correctos → permite acceso
- ✅ Token inválido → rechaza (401)
- ✅ Token sin "Bearer " → rechaza (401)
- ✅ Token sin claims (role, linkedPatientIds) → rechaza (403)
- ✅ Modo SKIP_AUTH en desarrollo → permite acceso con demo user
- ✅ `verifyTokenNoClaims` → permite acceso sin claims (para registro)

**Mock necesario:** Firebase Admin Auth (`auth.verifyIdToken`)

---

### ✅ **2. Rutas de Fotos** (`routes/photos.ts`) - PRIORIDAD ALTA

#### `GET /api/photos/patient/:id`
- ✅ Lista fotos del paciente correcto
- ✅ Ordena por fecha descendente
- ✅ Normaliza `createdAt` (Timestamp → ISO string)
- ✅ Manejo de errores (500)

#### `POST /api/photos` (metadata)
- ✅ Crea metadata con campos requeridos
- ✅ Valida `patientId` y `url`/`storagePath`
- ✅ Rechaza si faltan campos (400)
- ✅ Normaliza `createdAt`

#### `POST /api/photos/upload` (multipart)
- ✅ Valida que hay archivos (400 si no)
- ✅ Valida `patientId` (400 si falta)
- ✅ **Autorización:** Solo caregiver puede subir (403 si no)
- ✅ **Autorización:** Solo para pacientes vinculados (403 si no está vinculado)
- ✅ Sube archivo a Storage
- ✅ Genera signed URL
- ✅ Crea metadata en Firestore
- ✅ Maneja múltiples archivos (hasta 10)

#### `PUT /api/photos/:id`
- ✅ Actualiza metadata
- ✅ Merge de campos (no sobrescribe todo)

#### `DELETE /api/photos/:id`
- ✅ Elimina metadata de Firestore
- ✅ Elimina archivo de Storage si existe
- ✅ Retorna 404 si foto no existe
- ✅ Maneja error al eliminar archivo (log pero continúa)

**Mocks necesarios:** Firestore, Storage, Multer

---

### ✅ **3. Rutas de Pacientes** (`routes/patients.ts`) - PRIORIDAD ALTA

#### `GET /api/patients`
- ✅ Lista todos los pacientes
- ✅ Filtra por email (exacto)
- ✅ Filtra por `q` (búsqueda parcial en email/displayName)
- ✅ Búsqueda case-insensitive

#### `GET /api/patients/:id`
- ✅ Retorna paciente por ID
- ✅ Retorna 404 si no existe

#### `POST /api/patients/:id/assign`
- ✅ **Autorización:** Solo caregiver puede asignar (403)
- ✅ Crea vínculo en transacción atómica
- ✅ Retorna 404 si paciente no existe
- ✅ Retorna 409 si ya está asignado a otro cuidador
- ✅ Actualiza `assignedCaregiverId` en paciente
- ✅ Agrega `patientId` a `linkedPatientIds` del cuidador

#### `POST /api/patients/assign-by-code`
- ✅ **Autorización:** Solo caregiver puede asignar (403)
- ✅ Busca paciente por código de invitación (case-insensitive)
- ✅ Busca paciente por UID directo
- ✅ Retorna 404 si código no existe
- ✅ Crea vínculo en transacción atómica

#### `POST /api/patients/:id/unassign`
- ✅ **Autorización:** Solo caregiver puede desasignar (403)
- ✅ Retorna 400 si no estaba asignado
- ✅ Retorna 403 si no está asignado a ese cuidador
- ✅ Elimina vínculo en transacción atómica

#### `POST /api/patients/:id/assign-doctor` / `unassign-doctor`
- ✅ Misma lógica que caregiver pero para rol "doctor"

**Mocks necesarios:** Firestore (transacciones), `req.user`

---

### ✅ **4. Rutas de Descripciones** (`routes/descriptions.ts`)

#### `POST /api/descriptions/text`
- ✅ Valida campos requeridos (patientId, photoId, description)
- ✅ **Autorización:** Solo paciente vinculado puede crear descripción
- ✅ Crea descripción en Firestore
- ✅ Actualiza metadata de foto (si existe)
- ✅ Maneja error al actualizar foto (no fatal)

#### `POST /api/descriptions/wizard`
- ✅ Valida campos requeridos (patientId, photoId, data)
- ✅ **Autorización:** Solo paciente vinculado
- ✅ Crea descripción tipo "wizard"
- ✅ Extrae summary de `data.details` y actualiza foto (si existe)

#### `GET /api/descriptions/patient/:id`
- ✅ Lista descripciones del paciente
- ✅ Ordena por fecha descendente
- ✅ Normaliza `createdAt` (Timestamp → Date → milisegundos)

**Mocks necesarios:** Firestore

---

### ✅ **5. Rutas de Reportes** (`routes/reports.ts`)

#### `GET /api/reports/patient/:id`
- ✅ Lista reportes del paciente
- ✅ Filtra por `from` (fecha inicial)
- ✅ Filtra por `to` (fecha final)
- ✅ Ordena por fecha descendente
- ✅ Normaliza `createdAt` (Timestamp → Date → milisegundos)

#### `POST /api/reports`
- ✅ **Autorización:** Solo doctor o caregiver puede crear (403)
- ✅ Valida campos requeridos (patientId, data)
- ✅ Crea reporte con `baseline` opcional
- ✅ Guarda `createdBy` (UID del usuario)

**Mocks necesarios:** Firestore, `req.user`

---

### ✅ **6. Rutas de Usuarios** (`routes/users.ts`)

#### `POST /api/users/complete-registration`
- ✅ Valida que existe `uid` (401 si no)
- ✅ Genera código de invitación si rol es "patient"
- ✅ Establece custom claims en Firebase Auth
- ✅ Actualiza documento en Firestore
- ✅ Retorna `ok: true` con `uid` y `patientId`

#### `GET /api/users/:id`
- ✅ **Requiere autenticación** (middleware)
- ✅ Retorna información básica del usuario
- ✅ Retorna 404 si no existe

**Mocks necesarios:** Firebase Admin Auth (`setCustomUserClaims`), Firestore

---

## 🛠️ Herramientas y Configuración Necesaria

### Dependencias de testing

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "@types/jest": "^29.5.0",
    "@types/supertest": "^2.0.16",
    "supertest": "^6.3.3"
  }
}
```

### Mocking de Firebase Admin

Necesitamos mockear:
- `firebaseAdmin.auth` → `verifyIdToken`, `setCustomUserClaims`
- `firebaseAdmin.firestore` → colecciones, documentos, transacciones
- `firebaseAdmin.storage` → bucket, archivos, signed URLs

### Estructura de tests

```
Backend/
├── src/
│   ├── routes/
│   │   ├── photos.ts
│   │   ├── patients.ts
│   │   └── ...
│   └── middleware/
│       └── expressAuth.ts
└── tests/
    ├── unit/
    │   ├── middleware/
    │   │   └── expressAuth.test.ts
    │   └── routes/
    │       ├── photos.test.ts
    │       ├── patients.test.ts
    │       ├── descriptions.test.ts
    │       ├── reports.test.ts
    │       └── users.test.ts
    └── __mocks__/
        └── firebaseAdmin.ts
```

---

## 📊 Cobertura Esperada

Según DoD: **>80% cobertura por módulo**

**Módulos críticos (deben tener >90%):**
- ✅ `expressAuth.ts` (seguridad)
- ✅ `routes/photos.ts` (upload, autorización)
- ✅ `routes/patients.ts` (transacciones, autorización)

**Módulos estándar (>80%):**
- ✅ `routes/descriptions.ts`
- ✅ `routes/reports.ts`
- ✅ `routes/users.ts`

---

## ✅ Checklist de Implementación

### Prioridad 1 (Ahora mismo)
- [ ] Instalar dependencias de testing (`supertest`, `@types/supertest`)
- [ ] Crear `__mocks__/firebaseAdmin.ts`
- [ ] Tests de `expressAuth.ts` (crítico para seguridad)
- [ ] Tests de `routes/photos.ts` (upload, autorización)
- [ ] Tests de `routes/patients.ts` (transacciones, autorización)

### Prioridad 2
- [ ] Tests de `routes/descriptions.ts`
- [ ] Tests de `routes/reports.ts`
- [ ] Tests de `routes/users.ts`
- [ ] Configurar cobertura en CI/CD

### Prioridad 3
- [ ] Tests de integración (con Firebase Emulator)
- [ ] Tests de carga (k6, Artillery)

