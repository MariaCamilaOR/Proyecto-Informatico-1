import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginEmailPassword, loginWithGoogle } from "../store/thunks/authThunks";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routeByRole, labelForRole } from "../lib/roles";
export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, error } = useSelector((s) => s.auth);
    const [form, setForm] = useState({ email: "", password: "" });
    // Limpia posibles claves de demo
    useEffect(() => {
        localStorage.removeItem("demo-user");
        localStorage.removeItem("demo-role");
    }, []);
    // Redirige cuando haya rol, SOLO si no estamos ya allí
    useEffect(() => {
        if (!user?.role)
            return;
        const target = routeByRole(user.role);
        if (location.pathname !== target) {
            navigate(target, { replace: true });
        }
    }, [user?.role, location.pathname, navigate]);
    const onSubmit = async (e) => {
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
            await dispatch(loginWithGoogle());
            // si el usuario existe y tiene rol en Firestore, el slice se llenará y el useEffect redirige
        }
        catch {
            // popup cerrado u otro caso benigno
        }
    };
    return (_jsx("div", { className: "layout-content", children: _jsxs("div", { className: "card", children: [_jsx("h2", { style: { textAlign: "center", color: "var(--primary-acc)" }, children: "Iniciar sesi\u00F3n" }), _jsxs("form", { onSubmit: onSubmit, children: [_jsx("input", { type: "email", name: "email", placeholder: "Correo electr\u00F3nico", value: form.email, onChange: (e) => setForm((s) => ({ ...s, email: e.target.value })), autoComplete: "email" }), _jsx("input", { type: "password", name: "password", placeholder: "Contrase\u00F1a", value: form.password, onChange: (e) => setForm((s) => ({ ...s, password: e.target.value })), autoComplete: "current-password" }), _jsx("button", { type: "submit", disabled: loading, children: loading ? "Cargando..." : "Entrar" })] }), _jsx("button", { className: "google", onClick: onGoogle, disabled: loading, children: "Ingresar con Google" }), user?.role && (_jsxs("p", { style: { textAlign: "center", marginTop: 8 }, children: ["Rol detectado: ", _jsx("b", { children: labelForRole(user.role) })] })), error && _jsx("p", { className: "error", children: error }), _jsxs("p", { style: { textAlign: "center", marginTop: 10 }, children: ["\u00BFNo tienes cuenta?", " ", _jsx(Link, { to: "/register", style: { color: "var(--primary-acc)" }, children: "Reg\u00EDstrate" })] })] }) }));
}
