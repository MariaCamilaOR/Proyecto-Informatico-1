import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { registerAuth, registerWithGoogle } from "../store/thunks/authThunks";
import { Link, useNavigate } from "react-router-dom";
import RoleSelector from "../components/Auth/RoleSelector";
import type { Role } from "../lib/roles";

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [role, setRole] = useState<Role>("PATIENT");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return alert("Completa todos los campos");
    if (form.password.length < 6) return alert("La contraseña debe tener mínimo 6 caracteres");

    await dispatch(registerAuth(form.email, form.password, form.name, role));
    // Igual al proyecto base: volvemos al login
    navigate("/login", { replace: true });
  };

  const onGoogleRegister = async () => {
    // Se registra con Google y guarda el rol seleccionado en Firestore
    await dispatch(registerWithGoogle(role) as any);
    navigate("/login", { replace: true });
  };

  return (
    <div className="layout-content">
  <div className="card">
        <h2 style={{ textAlign: "center", color: "#58a6ff" }}>Crear una cuenta</h2>

        {/* Selector de rol: Paciente | Cuidador | Médico */}
        <RoleSelector value={role} onChange={setRole} />

        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <button
          type="button"
          className="google"
          onClick={onGoogleRegister}
          disabled={loading}
        >
          Registrarme con Google
        </button>

        {error && <p className="error">{error}</p>}

        <p style={{ textAlign: "center", marginTop: 10 }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
