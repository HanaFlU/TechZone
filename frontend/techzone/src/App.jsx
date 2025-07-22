import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/layout/user/Navbar';
import Footer from './components/layout/user/Footer';
import Sidebar from './components/layout/admin/Sidebar';

import HomePage from './pages/HomePage';
import AccountLayout from './pages/User/AccountLayout';
import ProfilePage from './pages/User/ProfilePage';
import AddressesPage from './pages/User/AddressesPage';
import AddressForm from './pages/User/AddressForm';
import OrderHistoryPage from './pages/User/OrderHistoryPage';
import CartPage from './pages/Cart';
import OrderPage from './pages/Order/Order';

import AdminDashboard from './pages/Admin/AdminDashboard';

import NotFoundPage from './pages/NotFoundPage';

import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';


import { AuthProvider } from './context/AuthContext'
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminCustomer from './pages/Admin/AdminCustomer';
import AdminStaff from './pages/Admin/AdminStaff';
import AdminCustomerOrderList from './pages/Admin/AdminCustomerOrderList';

const App = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      setAdminMode(true);
    } else {
      setAdminMode(false);
    }
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className='m-0 p-0 h-screen'>
        {!adminMode && <Navbar onAccountClick={() => setShowLoginModal(true)} setAdminMode={setAdminMode} />}
        <main className='h-screen'>
          {adminMode ? (
            <Sidebar onVisitStore={() => {
              setAdminMode(false);
              window.location.href = '/';
            }}>
              <Routes>
                <Route element={<AdminRoute />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  {/* <Route path="/admin/products" element={<AdminProduct />} />
                  <Route path="/admin/category" element={<AdminCategory />} />
                  <Route path="/admin/specification" element={<AdminSpec />} />
                  <Route path="/admin/orders" element={<AdminOrder />} /> */}
                  <Route path="/admin/customers" element={<AdminCustomer />} />
                  <Route path="/admin/customer-order/:customerId" element={<AdminCustomerOrderList />} />
                  <Route path="/admin/staff" element={<AdminStaff />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Sidebar>
          ) : (
            <>
              <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/account' element={<AccountLayout />}> 
                  <Route index element={<ProfilePage />} />
                  <Route path='addresses' element={<AddressesPage />} />
                  <Route path="addresses/add" element={<AddressForm />} />
                  <Route path="addresses/edit/:id" element={<AddressForm />} />
                  <Route path='orders' element={<OrderHistoryPage />} />
                </Route>
                <Route path='/cart' element={<CartPage />} />
                <Route path='/order' element={<OrderPage />} />
                <Route element={<ProtectedRoute />}>
                  {/* <Route path='' element={} /> */}
                </Route>
                <Route path='*' element={<NotFoundPage />} />
              </Routes>
            </>
          )}
        </main>
        {!adminMode && <Footer />}
        
        {/* Modal */}
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onSwitch={() => { setShowLoginModal(false); setShowRegisterModal(true); }} />}
        {showRegisterModal && <RegisterModal onClose={()=>setShowRegisterModal(false) } onSwitch={() => { setShowLoginModal(true); setShowRegisterModal(false); }} />}
      </div>
    </AuthProvider>
  )
}

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;

