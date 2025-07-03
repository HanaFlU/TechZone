import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import AccountPage from './pages/User/AccountPage';
import CartPage from './pages/Cart';
import OrderPage from './pages/User/Order';

import AdminDashboard from './pages/Admin/AdminDashboard';

import NotFoundPage from './pages/NotFoundPage';

import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';

import { AuthProvider } from './context/AuthContext'
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className=''>
          
            <Navbar onAccountClick={()=>setShowLoginModal(true)} />
            <main className='m-4'>
              <Routes>
                <Route path='/' element={<HomePage/>}/>
                <Route path='/account' element={<AccountPage />} />
                <Route path='/cart' element={<CartPage />} />
                <Route path='/order' element={<OrderPage />} />

                <Route element={<ProtectedRoute />}>
                  {/* <Route path='' element={} /> */}
                </Route>
                
                <Route element={<AdminRoute />}>
                  <Route path='/dashboard' element={<AdminDashboard/>} />
                </Route>

                <Route path='*' element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            
            {/* Modal */}
            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onSwitch={() => { setShowLoginModal(false); setShowRegisterModal(true); }} />}
            {showRegisterModal && <RegisterModal onClose={()=>setShowRegisterModal(false) } onSwitch={() => { setShowLoginModal(true); setShowRegisterModal(false); }} />}
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App;

