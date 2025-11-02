import type { Role } from "../../lib/roles";

export default function RoleSelector({ value, onChange }:{ value: Role; onChange:(r:Role)=>void }) {
  const opts: Role[] = ['PATIENT','CAREGIVER','DOCTOR'];
  return (
<div className="role-tabs">
  {opts.map(r => (
    <button
      key={r}
      type="button"
      className={`role-tab ${value===r ? 'active' : ''}`}
      onClick={() => onChange(r)}
    >
      {r==='PATIENT'?'Paciente':r==='CAREGIVER'?'Cuidador':'Médico'}
    </button>
  ))}
</div>
  );
}
