// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { loginEmailPassword, loginWithGoogle } from "../store/thunks/authThunks";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routeByRole, labelForRole } from "../lib/roles";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector((s: RootState) => s.auth);

  const [form, setForm] = useState({ email: "", password: "" });

  // Limpia posibles claves de demo
  useEffect(() => {
    localStorage.removeItem("demo-user");
    localStorage.removeItem("demo-role");
  }, []);

  // Redirige cuando haya rol, SOLO si no estamos ya allí
  useEffect(() => {
    if (!user?.role) return;
    const target = routeByRole(user.role);
    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [user?.role, location.pathname, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Completa correo y contraseña");
      return;
    }
    await dispatch(loginEmailPassword(form.email, form.password));
    // la redirección ocurre en el useEffect cuando haya rol
  };

  const onGoogle = async () => {
    try {
      await dispatch(loginWithGoogle() as any);
      // si el usuario existe y tiene rol en Firestore, el slice se llenará y el useEffect redirige
    } catch {
      // popup cerrado u otro caso benigno
    }
  };

  return (
    <div className="layout-content">
      <div className="card" style={{ width: 380 }}>
        <h2 style={{ textAlign: "center", color: "var(--primary-acc)" }}>
          Iniciar sesión
        </h2>

        <form onSubmit={onSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Cargando..." : "Entrar"}
          </button>
        </form>

        <button className="google" onClick={onGoogle} disabled={loading}>
          Ingresar con Google
        </button>

        {/* Puedes comentar este bloque si prefieres no mostrarlo en login */}
        {user?.role && (
          <p style={{ textAlign: "center", marginTop: 8 }}>
            Rol detectado: <b>{labelForRole(user.role)}</b>
          </p>
        )}

        {error && <p className="error">{error}</p>}

        <p style={{ textAlign: "center", marginTop: 10 }}>
          ¿No tienes cuenta?{" "}
          <Link to="/register" style={{ color: "var(--primary-acc)" }}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
