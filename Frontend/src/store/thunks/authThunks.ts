import { AppDispatch } from '../store';
import {
  startLoading,
  finishLoading,
  loginSuccess,
  logoutSuccess,
  authError,
} from '../slices/authSlice';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { api } from '../../api';
import type { Role } from '../../lib/roles';

const isIgnorablePopupError = (code?: string) =>
  code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request';

//email y pasword
export const registerAuth = (
  email: string,
  password: string,
  name: string,
  role: Role
) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });

      // Guardar perfil con rol en Firestore
      await setDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        email,
        displayName: name,
        role,
        createdAt: Date.now(),
      });

      // Ask backend to assign custom claims for this new user so they can upload/view own resources
      try {
        await api.post('/users/complete-registration', { patientId: res.user.uid, role });
      } catch (err) {
        // non-fatal: log but continue. The admin can still set claims manually.
        // eslint-disable-next-line no-console
        console.warn('Failed to request claim assignment from backend:', (err as any)?.message || err);
      }

      await signOut(auth);
    } catch (e: any) {
      dispatch(authError(e?.message ?? 'Error al registrar'));
    } finally {
      dispatch(finishLoading());
    }
  };
};

//  Email/Password - Login
export const loginEmailPassword = (email: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      const snap = await getDoc(doc(db, 'users', res.user.uid));
      const role = snap.exists() ? (snap.data().role as Role | undefined) : undefined;

      dispatch(
        loginSuccess({
          uid: res.user.uid,
          email: res.user.email ?? '',
          displayName: res.user.displayName ?? '',
          role,
        })
      );
    } catch (e: any) {
      dispatch(authError(e?.message ?? 'Error al iniciar sesión'));
    } finally {
      dispatch(finishLoading());
    }
  };
};

//Logout
export const logoutFirebase = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
      await signOut(auth);
      dispatch(logoutSuccess());
    } catch (e: any) {
      dispatch(authError(e?.message ?? 'Error al cerrar sesión'));
    } finally {
      dispatch(finishLoading());
    }
  };
};

// Goolgle registro con rol
export const registerWithGoogle = (role: Role) => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;

      const ref = doc(db, 'users', u.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        // Ya existe: asegura rol si faltaba, sale a login
        const data = snap.data() || {};
        if (!data.role) {
          await setDoc(ref, { role }, { merge: true });
        }
        await signOut(auth);
        alert('Ya existe una cuenta con Google. Inicia sesión.');
        return;
      }

      // Crear perfil nuevo con rol
      await setDoc(ref, {
        uid: u.uid,
        email: u.email ?? '',
        displayName: u.displayName ?? '',
        photoURL: u.photoURL ?? '',
        role,
        createdAt: Date.now(),
      });

      // Request backend to set custom claims for this new Google user
      try {
        await api.post('/users/complete-registration', { patientId: u.uid, role });
      } catch (err) {
        // non-fatal: log but continue
        // eslint-disable-next-line no-console
        console.warn('Failed to request claim assignment for google-registered user:', (err as any)?.message || err);
      }

      await signOut(auth);
      alert('Registro con Google exitoso. Ahora puedes iniciar sesión.');
    } catch (e: any) {
      // Si el usuario cerró el popup, no lo tratamos como error crítico
      if (isIgnorablePopupError(e?.code)) {
        return dispatch(finishLoading());
      }
      dispatch(authError(e?.message ?? 'Error al registrar con Google'));
    } finally {
      dispatch(finishLoading());
    }
  };
};

// login google
export const loginWithGoogle = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;

      const ref = doc(db, 'users', u.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await signOut(auth);
        alert('Tu cuenta Google no está registrada. Regístrate primero.');
        return;
      }

      const data = snap.data() as { role?: Role };
      dispatch(
        loginSuccess({
          uid: u.uid,
          email: u.email ?? '',
          displayName: u.displayName ?? '',
          role: data.role, // rol para redirigir al portal
        })
      );
    } catch (e: any) {
      if (isIgnorablePopupError(e?.code)) {
        return dispatch(finishLoading());
      }
      dispatch(authError(e?.message ?? 'Error al iniciar sesión con Google'));
    } finally {
      dispatch(finishLoading());
    }
  };
};
