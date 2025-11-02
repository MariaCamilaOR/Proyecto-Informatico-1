import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../../store/store';

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const user = useSelector((s: RootState) => s.auth.user);
  return user ? children : <Navigate to="/login" replace />;
}
