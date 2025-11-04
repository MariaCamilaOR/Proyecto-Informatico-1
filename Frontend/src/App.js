import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes } from "react-router-dom";
import { appRoutes } from "./routes";
import "./styles/globals.css";
function Layout({ children }) {
    return (_jsxs("div", { className: "layout-container", children: [_jsx("header", { className: "layout-header", children: "DoYouRemember" }), _jsx("main", { className: "layout-content", children: children }), _jsx("footer", { className: "layout-footer", children: "\u00A9 2025" })] }));
}
export default function App() {
    // No dupliques rutas aquí: solo renderiza appRoutes.
    return (_jsx(Layout, { children: _jsx(Routes, { children: appRoutes }) }));
}
