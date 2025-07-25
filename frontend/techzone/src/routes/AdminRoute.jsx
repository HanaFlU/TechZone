import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminRoute() {
  const { user } = useContext(AuthContext);
  const allowedRoles = ['AD', 'STAFF', 'MANGER'];

  return allowedRoles.includes(user?.role) ? <Outlet /> : <Navigate to="/unauthorized " />;
}
