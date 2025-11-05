// Mock de Firebase Admin SDK para tests
// Este archivo se usa automáticamente cuando se importa desde firebaseAdmin

export const mockFirestore = {
  collection: jest.fn((name: string) => ({
    doc: jest.fn((id: string) => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: true,
      id,
      data: jest.fn(() => ({})),
    })),
    add: jest.fn((data: any) => ({
      id: "mock-doc-id",
      get: jest.fn(() => ({
        id: "mock-doc-id",
        data: jest.fn(() => data),
        exists: true,
      })),
    })),
    where: jest.fn((field: string, op: string, value: any) => ({
      orderBy: jest.fn((field: string, direction?: string) => ({
        get: jest.fn(),
        limit: jest.fn((n: number) => ({ get: jest.fn() })),
      })),
      get: jest.fn(),
      limit: jest.fn((n: number) => ({ get: jest.fn() })),
    })),
    orderBy: jest.fn((field: string, direction?: string) => ({
      get: jest.fn(),
    })),
    get: jest.fn(),
  })),
  runTransaction: jest.fn((callback: any) => Promise.resolve(callback({ get: jest.fn() }))),
  FieldValue: {
    arrayUnion: jest.fn((...items: any[]) => items),
    arrayRemove: jest.fn((...items: any[]) => items),
    delete: jest.fn(() => null),
  },
};

export const mockStorage = {
  bucket: jest.fn(() => ({
    file: jest.fn((path: string) => ({
      save: jest.fn(),
      getSignedUrl: jest.fn(() => Promise.resolve(["https://signed-url.example.com"])),
      delete: jest.fn(),
    })),
  })),
};

export const mockAuth = {
  verifyIdToken: jest.fn(),
  setCustomUserClaims: jest.fn(),
};

const mockAdmin = {
  auth: jest.fn(() => mockAuth),
  firestore: jest.fn(() => mockFirestore),
  storage: jest.fn(() => mockStorage),
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
  apps: [],
};

// Agregar FieldValue al admin para compatibilidad con admin.firestore.FieldValue
(mockAdmin as any).firestore.FieldValue = mockFirestore.FieldValue;

// Export default para compatibilidad
export default mockAdmin;

// Export named para que coincida con firebaseAdmin.ts
// En firebaseAdmin.ts se usa: export const auth = admin.auth();
// Entonces necesitamos que auth sea el resultado de admin.auth()
export const auth = mockAuth;
export const firestore = mockFirestore;
export const storage = mockStorage;

