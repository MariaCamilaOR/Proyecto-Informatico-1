import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Role } from "../../lib/roles";

type User = { uid: string; email: string; displayName?: string; role?: Role } | null;

interface AuthState {
  user: User;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = { user: null, loading: false, error: null };

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLoading: (s) => { s.loading = true; s.error = null; },
    loginSuccess: (s, a: PayloadAction<NonNullable<User>>) => { s.user = a.payload; s.loading = false; },
    logoutSuccess: (s) => { s.user = null; s.loading = false; },
    authError: (s, a: PayloadAction<string>) => { s.error = a.payload; s.loading = false; },
    finishLoading: (s) => { s.loading = false; },
  },
});

export const { startLoading, loginSuccess, logoutSuccess, authError, finishLoading } = slice.actions;
export default slice.reducer;
