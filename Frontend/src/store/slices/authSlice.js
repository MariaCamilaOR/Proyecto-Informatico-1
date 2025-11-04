import { createSlice } from '@reduxjs/toolkit';
const initialState = { user: null, loading: false, error: null };
const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        startLoading: (s) => { s.loading = true; s.error = null; },
        loginSuccess: (s, a) => { s.user = a.payload; s.loading = false; },
        logoutSuccess: (s) => { s.user = null; s.loading = false; },
        authError: (s, a) => { s.error = a.payload; s.loading = false; },
        finishLoading: (s) => { s.loading = false; },
    },
});
export const { startLoading, loginSuccess, logoutSuccess, authError, finishLoading } = slice.actions;
export default slice.reducer;
