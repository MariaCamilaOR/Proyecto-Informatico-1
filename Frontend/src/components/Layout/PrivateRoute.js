import { jsx as _jsx } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
export default function PrivateRoute({ children }) {
    const user = useSelector((s) => s.auth.user);
    return user ? children : _jsx(Navigate, { to: "/login", replace: true });
}
