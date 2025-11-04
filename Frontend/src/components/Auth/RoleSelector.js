import { jsx as _jsx } from "react/jsx-runtime";
export default function RoleSelector({ value, onChange }) {
    const opts = ['PATIENT', 'CAREGIVER', 'DOCTOR'];
    return (_jsx("div", { className: "role-tabs", children: opts.map(r => (_jsx("button", { type: "button", className: `role-tab ${value === r ? 'active' : ''}`, onClick: () => onChange(r), children: r === 'PATIENT' ? 'Paciente' : r === 'CAREGIVER' ? 'Cuidador' : 'Médico' }, r))) }));
}
