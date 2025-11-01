## Backend (Firebase + Express)

This backend is a minimal TypeScript Express server that uses Firebase Admin SDK to read and return Firestore documents for photos and reports. It expects a Firebase service account to be provided via environment variables.

Steps you must do in the Firebase Console (browser) before running this backend:

1. Create a Firebase project
   - Go to https://console.firebase.google.com/ and create a new project (or use the existing `doyouremember-pi` project if that's yours).

2. Enable Authentication
   - In the Firebase Console, go to Authentication -> Get started.
   - Enable at least Email/Password (or the providers you need).

3. Enable Firestore
   - Go to Firestore Database -> Create database -> Start in production or test mode as appropriate.
   - Choose a location.

4. Enable Storage (if you store photo files)
   - Go to Storage -> Get started. Configure a storage bucket.

5. Create a Service Account and download the key
   - Go to Project Settings -> Service accounts -> Generate new private key.
   - Download the JSON file securely.

6. Set environment variables for the backend
   - Create a `.env.local` file in the `Backend` folder or configure your host (Vercel) environment variables.
   - Add one of the following options:

   Option A (recommended for local dev):
   SERVICE_ACCOUNT_KEY_PATH=./keys/service-account.json

   - Place the downloaded JSON at that path (relative to Backend folder).

   Option B (if you prefer env var JSON):
   SERVICE_ACCOUNT_KEY_JSON='{...json content...}'

   Also add:
   PORT=3000
   
   For local demo (frontend uses a simulated auth), you can skip token verification by adding:
   SKIP_AUTH=true
   DEMO_UID=demo-user-123
   DEMO_ROLE=patient
   DEMO_PATIENT_ID=demo-patient-123

7. Firestore structure expected by the backend
   - photos collection: documents with fields { patientId: string, url?: string, storagePath?: string, tags?: string[], description?: string, createdAt: Timestamp }
   - reports collection: documents with fields { patientId: string, data: object, createdAt: Timestamp }

8. Security rules and indexes
   - This repo contains `firestore.rules` and `firestore.indexes.json`; review and publish them in the Firebase Console -> Firestore -> Rules / Indexes.

9. Run locally
   - In `Backend` run:

   npm install
   npm run dev

10. Deploy (Vercel)
   - Set the same environment variables in Vercel (SERVICE_ACCOUNT_KEY_JSON or upload the key securely) and point the project root to `Backend` or create serverless functions using the same code.

Notes and next steps
 - Currently endpoints provided:
   - GET /api/health
   - GET /api/photos/patient/:id (requires Authorization: Bearer <idToken>)
   - GET /api/reports/patient/:id?from=YYYY-MM-DD&to=YYYY-MM-DD (requires auth)
 - The backend uses Firebase ID tokens to authenticate users; ensure the frontend sends Authorization header with `Bearer <token>` (frontend already does this).
 - Improve: signed upload URLs, create/modify photo documents on upload, role-based access checks, pagination, more endpoints (caregiver/patient management).
