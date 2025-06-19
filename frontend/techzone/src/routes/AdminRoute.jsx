import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminRoute() {
  const { user } = useContext(AuthContext);
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/" />;
}
