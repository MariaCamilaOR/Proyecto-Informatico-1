import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerAuth, registerWithGoogle } from "../store/thunks/authThunks";
import { Link, useNavigate } from "react-router-dom";
import RoleSelector from "../components/Auth/RoleSelector";
export default function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((s) => s.auth);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [role, setRole] = useState("PATIENT");
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password)
            return alert("Completa todos los campos");
        if (form.password.length < 6)
            return alert("La contraseña debe tener mínimo 6 caracteres");
        await dispatch(registerAuth(form.email, form.password, form.name, role));
        // Igual al proyecto base: volvemos al login
        navigate("/login", { replace: true });
    };
    const onGoogleRegister = async () => {
        // Se registra con Google y guarda el rol seleccionado en Firestore
        await dispatch(registerWithGoogle(role));
        navigate("/login", { replace: true });
    };
    return (_jsx("div", { className: "layout-content", children: _jsxs("div", { className: "card", children: [_jsx("h2", { style: { textAlign: "center", color: "#58a6ff" }, children: "Crear una cuenta" }), _jsx(RoleSelector, { value: role, onChange: setRole }), _jsxs("form", { onSubmit: onSubmit, children: [_jsx("input", { type: "text", name: "name", placeholder: "Nombre completo", value: form.name, onChange: (e) => setForm((s) => ({ ...s, name: e.target.value })) }), _jsx("input", { type: "email", name: "email", placeholder: "Correo electr\u00F3nico", value: form.email, onChange: (e) => setForm((s) => ({ ...s, email: e.target.value })) }), _jsx("input", { type: "password", name: "password", placeholder: "Contrase\u00F1a", value: form.password, onChange: (e) => setForm((s) => ({ ...s, password: e.target.value })) }), _jsx("button", { type: "submit", disabled: loading, children: loading ? "Registrando..." : "Registrarme" })] }), _jsx("button", { type: "button", className: "google", onClick: onGoogleRegister, disabled: loading, children: "Registrarme con Google" }), error && _jsx("p", { className: "error", children: error }), _jsxs("p", { style: { textAlign: "center", marginTop: 10 }, children: ["\u00BFYa tienes cuenta? ", _jsx(Link, { to: "/login", children: "Inicia sesi\u00F3n" })] })] }) }));
}
