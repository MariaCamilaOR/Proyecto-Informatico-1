# Tests de Integración

Estos tests verifican la integración real entre el Backend y Firebase (Firestore, Storage, Auth) y flujos completos Frontend ↔ Backend.

## ⚠️ Requisitos

**IMPORTANTE:** Estos tests usan Firebase real y requieren:

1. **Credenciales de Firebase configuradas** en `.env.local`:
   ```env
   SERVICE_ACCOUNT_KEY_PATH=./keys/service-account.json
   # O
   SERVICE_ACCOUNT_KEY_JSON='{"type":"service_account",...}'
   ```

2. **Proyecto de Firebase activo** con:
   - Firestore habilitado
   - Storage habilitado
   - Authentication habilitado

3. **Permisos adecuados** en Firebase:
   - Los tests crearán usuarios y documentos reales (con prefijo `test_`)
   - Los tests limpian automáticamente los datos de prueba al finalizar

## 🚀 Ejecutar Tests

### Ejecutar todos los tests de integración:
```bash
npm test -- tests/integration
```

### Ejecutar un archivo específico:
```bash
npm test -- tests/integration/firestore.test.ts
npm test -- tests/integration/storage.test.ts
npm test -- tests/integration/auth.test.ts
npm test -- tests/integration/routes.test.ts
```

### Ejecutar solo tests unitarios (excluir integración):
```bash
npm test -- --testPathIgnorePatterns=integration
```

## 📋 Tests Disponibles

### 1. `firestore.test.ts` - Integración con Firestore
- ✅ CRUD básico (crear, leer, actualizar, eliminar)
- ✅ Queries (where, orderBy, limit)
- ✅ Transacciones (éxito y rollback)
- ✅ Operaciones con arrays (arrayUnion, arrayRemove)
- ✅ Timestamps (serverTimestamp)

### 2. `storage.test.ts` - Integración con Firebase Storage
- ✅ Upload de archivos
- ✅ Metadata de archivos
- ✅ Signed URLs (generación y expiración)
- ✅ Eliminación de archivos
- ✅ Listado de archivos
- ✅ Integración Storage ↔ Firestore

### 3. `auth.test.ts` - Integración con Firebase Auth
- ✅ Gestión de usuarios (crear, actualizar, eliminar)
- ✅ Custom Claims (establecer, actualizar, eliminar)
- ✅ Integración Auth ↔ Firestore (sincronización de perfiles)
- ✅ Fallback a Firestore cuando no hay claims en token

### 4. `routes.test.ts` - Flujos completos Frontend ↔ Backend
- ✅ **HU-1.1**: Subir foto (cuidador → backend → storage → firestore → paciente)
- ✅ **HU-2.2**: Describir foto (paciente → backend → firestore → cuidador)
- ✅ **HU-10**: Vincular cuidador-paciente (validación → vínculo → claims)
- ✅ **HU-5**: Ver informe simple (solicitud → cálculo → métricas)
- ✅ Seguridad: Acceso no autorizado y acceso permitido

## 🧹 Limpieza Automática

Los tests automáticamente:
- Limpian documentos creados con prefijo `test_` al finalizar
- Eliminan usuarios de prueba de Firebase Auth
- Eliminan archivos de Storage de prueba

Si los tests se interrumpen, puedes limpiar manualmente buscando documentos con prefijo `test_` en Firebase Console.

## 🔧 Variables de Entorno para Tests

Los tests de integración respetan las mismas variables de entorno que el backend:

```env
# Opción A: Ruta al archivo JSON
SERVICE_ACCOUNT_KEY_PATH=./keys/service-account.json

# Opción B: JSON inline (escapar comillas)
SERVICE_ACCOUNT_KEY_JSON='{"type":"service_account","project_id":"...",...}'

# Opcional: Bucket de Storage personalizado
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
```

## ⚠️ Advertencias

1. **Datos reales**: Estos tests crean datos reales en Firebase. Usa un proyecto de desarrollo/testing.
2. **Costos**: Los tests pueden generar costos mínimos en Firebase (operaciones de Firestore, Storage).
3. **Tiempo**: Los tests de integración son más lentos que los unitarios (conexiones reales a Firebase).
4. **Network**: Requieren conexión a internet para acceder a Firebase.

## 🔄 Alternativa: Firebase Emulators (Recomendado para CI/CD)

Para desarrollo local y CI/CD, considera usar Firebase Emulators:

1. Instalar Firebase Tools:
   ```bash
   npm install -g firebase-tools
   ```

2. Inicializar emuladores:
   ```bash
   firebase init emulators
   ```

3. Configurar tests para usar emuladores (ver documentación de Firebase).

## 📊 Cobertura

Los tests de integración complementan los tests unitarios:
- **Unitarios**: Verifican lógica de negocio aislada (con mocks)
- **Integración**: Verifican que los componentes funcionan juntos con servicios reales

