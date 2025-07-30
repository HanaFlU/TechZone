import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Navbar from './components/layout/user/Navbar';
import Footer from './components/layout/user/Footer';
import Sidebar from './components/layout/admin/Sidebar';
import AIChatbot from './components/AIChatbot';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import AccountLayout from './pages/User/AccountLayout';
import ProfilePage from './pages/User/ProfilePage';
import AddressesPage from './pages/User/Address/AddressesPage';
import AddressForm from './pages/User/Address/AddressForm';
import OrderHistoryPage from './pages/User/Order/OrderHistoryPage';
import CartPage from './pages/Cart';
import OrderPage from './pages/Order/Order';

import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminCustomer from './pages/Admin/ManageUsers/AdminCustomer';
import AdminStaff from './pages/Admin/ManageUsers/AdminStaff';
import AdminCustomerOrderList from './pages/Admin/ManageUsers/AdminCustomerOrderList';
import AdminCategory from './pages/Admin/ManageCategories/AdminCategory';
import AdminProduct from './pages/Admin/ManageProducts/AdminProduct';
import AdminOrderList from './pages/Admin/ManageOrders/AdminOrderList';
import AdminVoucher from './pages/Admin/ManageVoucher/AdminVoucher';

import NotFoundPage from './pages/NotFoundPage';

import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';

import ProductService from './services/ProductService';

import { AuthContext, AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext';
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import { useContext } from 'react';
import { Fab, Tooltip, Zoom } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChatIcon from '@mui/icons-material/Chat';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const { showLoginModal, setShowLoginModal } = useContext(AuthContext);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [products, setProducts] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };
  // Scroll to top
  const [showScroll, setShowScroll] = useState(false);
  const checkScrollTop = () => {
    const shouldShow = window.pageYOffset > 400;
    setShowScroll(shouldShow);
  };
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      setAdminMode(true);
    } else {
      setAdminMode(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Fetch all products for Navbar search suggestions
    ProductService.getAllProducts()
      .then(data => setProducts(data))
      .catch(err => console.error(err));

    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, []);

  return (
      <div className='min-h-screen flex flex-col bg-gray-50 m-0 p-0'>
        {!adminMode && (
          <Navbar
            onAccountClick={() => setShowLoginModal(true)}
            setAdminMode={setAdminMode}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            products={products}
          />
        )}
        <main className='abcs'>
          {adminMode ? (
            <Sidebar onVisitStore={() => {
              setAdminMode(false);
              navigate('/');
            }}>
              <Routes>
                <Route element={<AdminRoute />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProduct />} />
                  <Route path="/admin/category" element={<AdminCategory />} />
                  <Route path="/admin/vouchers" element={<AdminVoucher />} />
                  <Route path="/admin/orders" element={<AdminOrderList />} /> 
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
                  <Route path='/product/:id' element={<ProductDetailPage />} />
                  <Route path='/category/:slug' element={<CategoryPage />} />
                  <Route path='/cart' element={<CartPage />} />
                  <Route path='/unauthorized' element={<NotFoundPage />} />
                  
                <Route element={<ProtectedRoute />}>
                  <Route path='/account' element={<AccountLayout />}> 
                    <Route index element={<ProfilePage />} />
                    <Route path='addresses' element={<AddressesPage />} />
                    <Route path="addresses/add" element={<AddressForm />} />
                    <Route path="addresses/edit/:id" element={<AddressForm />} />
                    <Route path='orders' element={<OrderHistoryPage />} />
                  </Route>
                  <Route path='/order' element={<OrderPage />} />
                  {/* <Route path='' element={} /> */}
                </Route>
                  
                <Route path='*' element={<NotFoundPage />} />
              </Routes>
            </>
          )}
          {!isChatbotOpen && !adminMode && (
            <Tooltip title="Trò chuyện với AI" placement="left">
              <Fab
                  size="small"
                  color="primary"
                  aria-label="chat"
                  onClick={toggleChatbot}
                  sx={{
                      position: 'fixed',
                      bottom: { xs: 80, md: 30 },
                      right: { xs: 20, md: 30 },
                      bgcolor: '#328E6E',
                      '&:hover': { bgcolor: '#047857' },
                      zIndex: 1001
                  }}
              >
                  <ChatIcon fontSize='small'/>
              </Fab>
            </Tooltip>
          )}
          {!adminMode && (
            <Zoom in={showScroll} timeout={500}>
              <Tooltip title="Cuộn lên đầu trang" placement="left">
                <Fab
                    size="small"
                    color="primary"
                    aria-label="scroll back to top"
                    onClick={scrollTop}
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 80, md: 30 },
                        right: { xs: 70, md: 80 },
                        bgcolor: '#328E6E',
                        '&:hover': { bgcolor: '#047857' },
                        zIndex: 1000
                    }}
                >
                    <KeyboardArrowUpIcon fontSize='small'/>
                </Fab>
              </Tooltip>
            </Zoom>
          )}
        </main>
        {isChatbotOpen && <AIChatbot onClose={toggleChatbot} />}
        {!adminMode && <Footer />}
        
        {/* Modal */}
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onSwitch={() => { setShowLoginModal(false); setShowRegisterModal(true); }} />}
        {showRegisterModal && <RegisterModal onClose={() => setShowRegisterModal(false)} onSwitch={() => { setShowLoginModal(true); setShowRegisterModal(false); }} />}
      
      <ToastContainer
            position="top-right" // Vị trí hiển thị toast
            autoClose={5000} // Tự động đóng sau 5 giây
            hideProgressBar={false} // Hiển thị thanh tiến trình
            newestOnTop={false} // Toast mới nhất ở trên cùng
            closeOnClick // Đóng toast khi click
            rtl={false} // Hỗ trợ ngôn ngữ đọc từ phải sang trái
            pauseOnFocusLoss // Tạm dừng khi mất focus
            draggable // Cho phép kéo toast
            pauseOnHover // Tạm dừng khi hover
            theme="light" // Chủ đề của toast (light, dark, colored)
        />
      </div>
  )
}

const AppWithRouter = () => (
  <AuthProvider>
    <NotificationProvider>
      <Router>
        <App />
      </Router>
    </NotificationProvider>
  </AuthProvider>
);

export default AppWithRouter;

