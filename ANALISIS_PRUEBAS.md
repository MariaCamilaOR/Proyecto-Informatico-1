# 📋 Análisis de Pruebas para DoYouRemember

## 📊 Estado Actual del Proyecto

### ✅ Infraestructura Configurada

**Frontend:**
- ✅ Jest configurado (con `@testing-library/react`, `@testing-library/jest-dom`)
- ✅ Playwright configurado para E2E
- ✅ Scripts: `npm test` (Jest con cobertura), `npm run e2e` (Playwright)
- ⚠️ **Solo existe 1 smoke test** (`smoke.test.ts`)

**Backend:**
- ✅ Jest configurado (`jest.config.ts` con `ts-jest`, `collectCoverageFrom`)
- ⚠️ **No hay tests implementados**

**CI/CD:**
- ✅ GitHub Actions configurado (`.github/workflows/ci.yml`)
- ⚠️ **No ejecuta tests**, solo verifica credenciales y compilación

---

## 📜 Requisitos según el Documento

### Definición de Done (DoD)

Según tu documento, la DoD exige:

> **Pruebas unitarias e integrales:** Se han implementado pruebas unitarias que cubren adecuadamente la nueva funcionalidad (con un porcentaje de cobertura acordado, por ejemplo **> 80% en el módulo afectado**) y pruebas de integración si corresponden. Todas las pruebas automatizadas ejecutan correctamente (verdes) validando que los componentes funcionan y se comunican sin errores.

> **Verificación de criterios de aceptación:** La historia de usuario fue validada exhaustivamente contra sus criterios de aceptación, ya sea mediante pruebas manuales de QA, demostraciones funcionales o **pruebas de aceptación automatizadas**.

> **Atributos de calidad asegurados:** La funcionalidad cumple con los atributos de calidad pertinentes definidos en los **escenarios arquitectónicos** del proyecto (seguridad, rendimiento, usabilidad, escalabilidad).

---

## 🎯 Escenarios Arquitectónicos que Requieren Pruebas

### Escenario 1: Procesamiento de Carga Masiva de Fotografías

**Métricas objetivo:**
- Throughput: 2,500 fotos (500 GB) en 2 horas (20–25 fotos/minuto)
- Tiempo de respuesta < 4 s (percentil 95)
- Disponibilidad 99.9%
- Integridad: 0% de fotos corruptas o perdidas

**Pruebas necesarias:**
- ✅ **Pruebas de carga (Load Testing)**
- ✅ **Pruebas de estrés (Stress Testing)**
- ✅ **Pruebas de integridad de datos**

### Escenario 2: Análisis Cognitivo en Tiempo Real con Privacidad

**Métricas objetivo:**
- Latencia total < 8 s desde grabación hasta resultado
- Precisión de transcripción > 90%
- 100% de comunicaciones cifradas end-to-end
- Eliminación de datos después de 24 h

**Pruebas necesarias:**
- ✅ **Pruebas de rendimiento (Performance Testing)**
- ✅ **Pruebas de seguridad (Security Testing)**
- ✅ **Pruebas de precisión (Accuracy Testing)**

### Escenario 3: Generación de Informe Médico Integral

**Métricas objetivo:**
- Tiempo de generación < 15 s (6 meses de datos)
- Disponibilidad 99.9%
- Precisión de métricas 100%
- Exportación < 30 s a PDF

**Pruebas necesarias:**
- ✅ **Pruebas de rendimiento**
- ✅ **Pruebas de disponibilidad (Availability Testing)**
- ✅ **Pruebas de precisión de datos**

---

## 🧪 Plan de Pruebas Recomendado

### 1. Pruebas Unitarias (Frontend)

#### Componentes React

**Objetivo:** >80% cobertura según DoD

**Componentes a probar:**

1. **`PhotoUploader`** (HU-1.1)
   - ✅ Validación de formatos (JPG, PNG)
   - ✅ Asociación al paciente correcto
   - ✅ Manejo de errores de carga
   - ✅ Confirmación de éxito/error

2. **`PhotoTagger`** (HU-7)
   - ✅ Agregar etiquetas (personas, objetos, lugares)
   - ✅ Editar/eliminar etiquetas
   - ✅ Mover etiquetas
   - ✅ Ocultar/mostrar etiquetas

3. **`VoiceRecorder`** (HU-8)
   - ✅ Iniciar/detener grabación
   - ✅ Temporizador durante grabación
   - ✅ Mostrar transcripción
   - ✅ Edición manual de transcripción

4. **`DescriptionWizard`** (HU-2.2)
   - ✅ Flujo guiado paso a paso
   - ✅ Validación de campos obligatorios
   - ✅ Ejemplos de descripciones

5. **`OnboardingWizard`** (HU-9)
   - ✅ Flujo completo de onboarding
   - ✅ Repetir pasos
   - ✅ Saltar pasos
   - ✅ Resumen antes de confirmar

6. **`SimpleReport`** (HU-5)
   - ✅ Visualización de métricas (Memory Recall, Narrative Coherence)
   - ✅ Comparativa con línea base
   - ✅ Exportación PDF
   - ✅ Filtros por fecha y métricas (HU-11.1, HU-11.2)

7. **`ProtectedRoute` / `RoleGuard`** (Seguridad)
   - ✅ Redirección según rol
   - ✅ Bloqueo de acceso no autorizado
   - ✅ Validación de permisos

#### Hooks Personalizados

1. **`useAuth`**
   - ✅ Login/logout
   - ✅ Obtención de token
   - ✅ Validación de roles

2. **`usePhotos`**
   - ✅ Fetch de fotos por paciente
   - ✅ Upload de fotos
   - ✅ Manejo de errores

3. **`useReports`**
   - ✅ Fetch de reportes con filtros
   - ✅ Cálculo de métricas
   - ✅ Exportación

#### Utilidades y Librerías

1. **`lib/api.ts`**
   - ✅ Construcción de URLs
   - ✅ Manejo de headers (Authorization)
   - ✅ Manejo de errores HTTP

2. **`lib/auth.ts`**
   - ✅ Validación de tokens
   - ✅ Refresh de tokens
   - ✅ Claims de roles

---

### 2. Pruebas Unitarias (Backend)

#### Middleware

1. **`verifyTokenMiddleware`** (Seguridad crítica)
   - ✅ Validación de token válido
   - ✅ Rechazo de token inválido
   - ✅ Extracción de claims (role, linkedPatientIds)
   - ✅ Modo SKIP_AUTH para desarrollo
   - ✅ Manejo de errores de Firebase Auth

#### Rutas (Routes)

2. **`routes/photos.ts`**
   - ✅ `GET /api/photos/patient/:id` - Listado con filtros
   - ✅ `POST /api/photos` - Crear metadata
   - ✅ `POST /api/photos/upload` - Upload multipart
     - Validación de formato de archivo
     - Validación de permisos (solo caregiver)
     - Validación de paciente vinculado
     - Almacenamiento en Firebase Storage
     - Generación de signed URLs
   - ✅ `PUT /api/photos/:id` - Actualizar metadata
   - ✅ `DELETE /api/photos/:id` - Eliminar foto y archivo

3. **`routes/descriptions.ts`**
   - ✅ `POST /api/descriptions/text` - Descripción por texto
   - ✅ `POST /api/descriptions/wizard` - Descripción wizard
   - ✅ `GET /api/descriptions/patient/:id` - Listado
   - ✅ Validación de permisos (paciente vinculado)

4. **`routes/reports.ts`**
   - ✅ `GET /api/reports/patient/:id` - Con filtros de fecha
   - ✅ Validación de parámetros (from, to)

5. **`routes/patients.ts`**
   - ✅ `GET /api/patients` - Listado con filtro por email
   - ✅ `POST /api/patients/:id/assign` - Asignar cuidador
   - ✅ `POST /api/patients/assign-by-code` - Asignar por código
   - ✅ `POST /api/patients/:id/unassign` - Desasignar
   - ✅ Validación de transacciones Firestore

6. **`routes/users.ts`**
   - ✅ `POST /api/users/complete-registration` - Completar registro
   - ✅ `GET /api/users/:id` - Obtener usuario

#### Servicios (Futuros Microservicios)

7. **Servicio de Análisis (NLP/STT)** - Cuando se implemente
   - ✅ Transcripción de audio
   - ✅ Análisis de coherencia narrativa
   - ✅ Cálculo de Memory Recall
   - ✅ Manejo de errores de servicios externos

8. **Servicio de Notificaciones** - Cuando se implemente
   - ✅ Envío de notificaciones push
   - ✅ Envío de emails
   - ✅ Programación de recordatorios
   - ✅ Configuración de frecuencia

---

### 3. Pruebas de Integración

#### Backend ↔ Firebase

1. **Firestore**
   - ✅ Crear/leer/actualizar/eliminar documentos
   - ✅ Transacciones atómicas
   - ✅ Consultas con filtros y ordenamiento
   - ✅ Índices compuestos

2. **Firebase Storage**
   - ✅ Upload de archivos
   - ✅ Generación de signed URLs
   - ✅ Eliminación de archivos
   - ✅ Validación de permisos de Storage Rules

3. **Firebase Auth**
   - ✅ Verificación de ID tokens
   - ✅ Custom claims (role, linkedPatientIds)
   - ✅ Refresh tokens

#### Frontend ↔ Backend

4. **Flujos completos**

   **HU-1.1: Subir fotografías**
   - ✅ Cuidador sube foto → Backend valida → Almacena en Storage → Crea metadata en Firestore → Frontend muestra confirmación

   **HU-2.2: Describir fotos**
   - ✅ Paciente selecciona foto → Ingresa descripción → Backend guarda → Frontend actualiza lista

   **HU-10: Vincular cuidador-paciente**
   - ✅ Cuidador ingresa código → Backend valida → Crea vínculo → Actualiza claims → Frontend muestra estado

   **HU-5: Ver informe simple**
   - ✅ Cuidador solicita informe → Backend calcula métricas → Frontend muestra gráficos → Exporta PDF

#### Servicios Externos (Futuro)

5. **STT/NLP Service**
   - ✅ Integración con API de transcripción
   - ✅ Manejo de timeouts
   - ✅ Circuit breaker (si servicio externo falla)

6. **Notification Provider**
   - ✅ Envío de notificaciones
   - ✅ Manejo de fallos (retry, dead letter queue)

---

### 4. Pruebas End-to-End (E2E)

**Herramienta:** Playwright (ya configurado)

#### Flujos de Usuario Completos

1. **Flujo de Registro y Onboarding**
   - ✅ Registro de paciente
   - ✅ Completar registro (asignar rol)
   - ✅ Onboarding guiado (HU-9)
   - ✅ Subir primera foto
   - ✅ Etiquetar entidades (HU-7)
   - ✅ Agregar descripción de referencia

2. **Flujo de Cuidador**
   - ✅ Login como cuidador
   - ✅ Vincular con paciente (HU-10)
   - ✅ Subir fotos familiares (HU-1.1)
   - ✅ Agregar descripciones de referencia (HU-1.2)
   - ✅ Ver informe simple (HU-5)
   - ✅ Filtrar por fechas (HU-11.1)
   - ✅ Filtrar por métricas (HU-11.2)
   - ✅ Exportar PDF

3. **Flujo de Paciente**
   - ✅ Login como paciente
   - ✅ Visualizar fotos familiares (HU-2.1)
   - ✅ Describir foto por texto (HU-2.2)
   - ✅ Describir foto por voz (HU-8)
   - ✅ Ver recordatorios (HU-6)

4. **Flujo de Médico**
   - ✅ Login como médico
   - ✅ Ver informe de línea base (HU-4.1)
   - ✅ Recibir alertas (HU-4.2)
   - ✅ Configurar umbrales (HU-13.1)
   - ✅ Configurar frecuencia (HU-13.2)
   - ✅ Profundizar en detalle (HU-12)
   - ✅ Recalibrar línea base (HU-14)

5. **Flujo de Seguridad (HU-3)**
   - ✅ Login con credenciales válidas
   - ✅ Rechazo de credenciales inválidas
   - ✅ Validación de 2FA (cuando se implemente)
   - ✅ Acceso denegado a recursos no autorizados
   - ✅ Verificación de cifrado HTTPS/TLS

---

### 5. Pruebas de Rendimiento y Carga

**Herramientas recomendadas:** k6, Artillery, Apache JMeter

#### Escenario 1: Carga Masiva de Fotografías

```javascript
// Ejemplo de prueba con k6
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2h', target: 500 }, // 500 cuidadores simultáneos
    { duration: '10m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<4000'], // < 4s percentil 95
    http_req_failed: ['rate<0.001'], // < 0.1% errores
  },
};

export default function () {
  const file = open('./test-photo.jpg', 'b');
  const formData = {
    files: http.file(file, 'photo.jpg', 'image/jpeg'),
    patientId: 'test-patient-id',
  };
  
  const res = http.post('http://localhost:3000/api/photos/upload', formData, {
    headers: { 'Authorization': `Bearer ${__ENV.TOKEN}` },
  });
  
  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 4s': (r) => r.timings.duration < 4000,
  });
}
```

**Métricas a validar:**
- ✅ Throughput: 20-25 fotos/minuto
- ✅ Latencia P95 < 4s
- ✅ 0% de pérdida de datos
- ✅ Disponibilidad 99.9%

#### Escenario 2: Análisis Cognitivo en Tiempo Real

**Pruebas de latencia:**
- ✅ Latencia total < 8s (grabación → transcripción → análisis → resultado)
- ✅ Precisión de transcripción > 90%

#### Escenario 3: Generación de Informes

**Pruebas de rendimiento:**
- ✅ Generación de informe < 15s (6 meses de datos)
- ✅ Exportación PDF < 30s

---

### 6. Pruebas de Seguridad

#### Autenticación y Autorización

1. **Autenticación**
   - ✅ Token válido permite acceso
   - ✅ Token inválido rechazado
   - ✅ Token expirado rechazado
   - ✅ Token sin claims rechazado

2. **Autorización (RBAC)**
   - ✅ Paciente solo accede a sus datos
   - ✅ Cuidador solo accede a pacientes vinculados
   - ✅ Médico accede a todos los pacientes
   - ✅ Intento de acceso no autorizado rechazado

3. **Cifrado**
   - ✅ Comunicaciones HTTPS/TLS
   - ✅ Datos cifrados en reposo (Firebase Storage)
   - ✅ Tokens no expuestos en logs

#### Validación de Entrada

4. **Sanitización de datos**
   - ✅ Validación de formatos de archivo (solo JPG, PNG)
   - ✅ Validación de tamaños de archivo
   - ✅ Protección contra inyección SQL (N/A para Firestore)
   - ✅ Protección contra XSS (Frontend)

5. **Rate Limiting** (cuando se implemente)
   - ✅ Límite de requests por IP/usuario
   - ✅ Protección contra DoS

---

### 7. Pruebas de Disponibilidad y Resiliencia

#### Tolerancia a Fallos

1. **Circuit Breaker** (cuando se implemente)
   - ✅ Servicio externo falla → Circuit breaker abre
   - ✅ Servicio recupera → Circuit breaker cierra
   - ✅ Fallback graceful

2. **Retry Logic**
   - ✅ Reintentos automáticos con backoff exponencial
   - ✅ Límite de reintentos

3. **Health Checks**
   - ✅ `/api/health` responde correctamente
   - ✅ Verificación de dependencias (Firestore, Storage)

---

## 📈 Cobertura de Código

### Objetivo según DoD: >80% por módulo

**Métricas a monitorear:**

```bash
# Frontend
npm test -- --coverage --coverageThreshold='{
  "global": {
    "branches": 80,
    "functions": 80,
    "lines": 80,
    "statements": 80
  }
}'

# Backend
npm test -- --coverage --coverageThreshold='{
  "global": {
    "branches": 80,
    "functions": 80,
    "lines": 80,
    "statements": 80
  }
}'
```

**Archivos críticos que DEBEN tener >90% cobertura:**
- `Backend/src/middleware/expressAuth.ts` (seguridad crítica)
- `Backend/src/routes/photos.ts` (upload, validación de permisos)
- `Frontend/src/lib/auth.ts` (autenticación)
- `Frontend/src/components/Layout/ProtectedRoute.tsx` (autorización)

---

## 🔄 Integración con CI/CD

### Actualización del workflow de GitHub Actions

```yaml
# .github/workflows/ci.yml (extender)

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install
        run: |
          cd Frontend
          npm ci
      - name: Run unit tests
        run: |
          cd Frontend
          npm test -- --coverage --watchAll=false
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install
        run: |
          cd Backend
          npm ci
      - name: Run unit tests
        run: |
          cd Backend
          npm test -- --coverage --watchAll=false

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install
        run: |
          cd Frontend
          npm ci
      - name: Install Playwright
        run: |
          cd Frontend
          npx playwright install --with-deps
      - name: Run E2E tests
        run: |
          cd Frontend
          npm run e2e
        env:
          VITE_API_BASE_URL: http://localhost:3000/api
```

---

## 📝 Checklist de Implementación

### Prioridad Alta (Iteración 1)

- [ ] **Backend: Tests unitarios de middleware de autenticación**
- [ ] **Backend: Tests unitarios de rutas de fotos (upload, validación de permisos)**
- [ ] **Backend: Tests unitarios de rutas de pacientes (vínculo cuidador-paciente)**
- [ ] **Frontend: Tests unitarios de componentes críticos (PhotoUploader, ProtectedRoute)**
- [ ] **Frontend: Tests unitarios de hooks (useAuth, usePhotos)**
- [ ] **Tests de integración: Backend ↔ Firebase (Firestore, Storage, Auth)**
- [ ] **E2E: Flujo completo de registro y onboarding**
- [ ] **E2E: Flujo de cuidador (subir foto, ver informe)**

### Prioridad Media (Iteración 2)

- [ ] **Tests unitarios de todos los componentes restantes**
- [ ] **Tests de integración: Frontend ↔ Backend (flujos completos)**
- [ ] **E2E: Todos los flujos de usuario restantes**
- [ ] **Tests de rendimiento: Escenario 1 (carga masiva)**
- [ ] **Tests de seguridad: Autenticación, autorización, validación de entrada**
- [ ] **Configuración de cobertura >80% en CI/CD**

### Prioridad Baja (Futuro)

- [ ] **Tests de carga: Escenarios 2 y 3**
- [ ] **Tests de disponibilidad: Circuit breakers, health checks**
- [ ] **Tests de servicios externos (STT/NLP, Notificaciones) cuando se implementen**

---

## 🎓 Conclusiones

Según tu documento y el estado actual del proyecto:

1. **Infraestructura lista:** Jest y Playwright están configurados, pero falta implementar las pruebas.

2. **Gap crítico:** Solo hay 1 smoke test. No hay tests unitarios, de integración ni E2E implementados.

3. **Requisitos claros:** La DoD exige >80% de cobertura y pruebas de aceptación automatizadas.

4. **Escenarios arquitectónicos:** Requieren pruebas de rendimiento, carga y seguridad específicas.

5. **Próximos pasos:** Implementar tests unitarios de componentes críticos (autenticación, upload de fotos) y luego expandir a integración y E2E.

---

**Última actualización:** Basado en el documento de arquitectura y estado actual del proyecto (2025)

