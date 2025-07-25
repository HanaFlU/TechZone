import { useContext, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, setShowLoginModal } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user, setShowLoginModal]);

  return user?.role ? <Outlet /> : <Navigate to="/" state={{ from: location }} />;
}
