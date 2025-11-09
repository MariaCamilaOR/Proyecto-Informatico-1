# DoYouRemember - AI Agent Guidelines

## Project Overview
DoYouRemember is a memory support application for Alzheimer's patients. The app facilitates memory recall through photo descriptions, quizzes, and progress tracking.

## Architecture & Data Flow

### Core Components
- **Frontend** (`Frontend/`): React + Vite + Chakra UI
  - Pages in `src/pages/**`
  - Shared hooks in `src/hooks/`
  - UI components in `src/components/`

- **Backend** (`Backend/`): Node + Express + Firebase Admin
  - Route handlers in `src/routes/*.ts`
  - Authentication middleware in `src/middleware/`
  - Firebase config in `firebase/config.js`

### Key Data Flows
1. Photo Description Flow:
   ```
   CAREGIVER -> Upload Photo -> Create Description (/api/descriptions/wizard)
   -> Generate Quiz (/api/quizzes/generate) -> PATIENT Takes Quiz
   -> Score Calculated -> Reports Updated
   ```

2. Report Generation Flow:
   ```
   Quiz Submissions (/api/quizzes/:id/submit) -> Summary Aggregation
   -> Reports API (/api/reports/summary/:patientId) -> Doctor Dashboard
   ```

## Development Patterns

### Authentication & Authorization
- JWT via Firebase (`Authorization: Bearer <idToken>`)
- Role validation through `lib/roles.ts` (`hasPermission`, `normalizeRole`)
- Key roles: `PATIENT`, `CAREGIVER`, `DOCTOR`

### Code Organization
- Prefer TypeScript (`.tsx`) over JavaScript when duplicate files exist
- HTTP client abstraction in `lib/api.ts` (auto-injects Bearer token)
- Routes follow feature-based organization (e.g., `Photos/`, `Quiz/`, `Reports/`)

### Development Workflow
1. **Setup Commands**:
   ```bash
   # Backend
   cd Backend && npm i && npm run dev
   
   # Frontend
   cd Frontend && npm i && npm run dev
   ```

2. **Testing**:
   - Backend tests in `Backend/tests/{unit,integration}`
   - Test files follow pattern `*.test.ts`

## Common Tasks & Examples

### Adding New API Endpoints
1. Create route handler in `Backend/src/routes/`
2. Apply auth middleware: `verifyTokenMiddleware`
3. Update API client in `Frontend/src/lib/api.ts`

### Adding UI Features
1. Create/update components in appropriate feature directory
2. Use hooks from `src/hooks/` for data management
3. Apply role checks: `hasPermission(user.role, 'permission_name')`

### Example Component Structure
See `Frontend/src/pages/Photos/Upload.tsx` for photo upload workflow
See `Frontend/src/pages/Quiz/Take.tsx` for quiz interaction pattern

## Key Integration Points
- Firebase Admin SDK (Backend auth & storage)
- Chakra UI components (Frontend styling)
- React Query (API state management)

## Do's and Don'ts
✅ DO:
- Use TypeScript for new components
- Follow existing route structure
- Apply role-based permissions

❌ DON'T:
- Create duplicate JS/TS files
- Skip auth middleware
- Mix business logic in UI components