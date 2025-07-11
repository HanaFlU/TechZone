import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user } = useContext(AuthContext);
  return user?.role === 'CUS' || user?.role === 'AD' ? <Outlet /> : <Navigate to="/" />;
}
