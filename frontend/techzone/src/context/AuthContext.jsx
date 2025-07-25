import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [showLoginModal, setShowLoginModal] = useState(false); 

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    setShowLoginModal(false);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    // Refresh the page to ensure all components are updated with new user state
    window.location.reload();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
};