import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartService from '../services/CartService';
import Button from '../components/button/Button';

const CartPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartStored, setCartStored] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const navigate = useNavigate();

    // Lấy userId từ localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user && user._id) {
                    setCurrentUserId(user._id);
                } else {
                    console.error("Không tìm thấy userId trong localStorage.");
                    setLoading(false);
                    setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
                    // navigate('/login'); // Yêu cầu đăng nhập
                }
            } catch (e) {
                console.error("Fail khi lấy từ localStorage", e);
                setLoading(false);
                setError("Lỗi khi lấy userId. Vui lòng thử lại.");
            }
        } else {
            console.error("Không tìm thấy 'user' trong localStorage.");
            setLoading(false);
            setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem thông tin.");
            // navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchAndStoreCart = async () => {
            if (!currentUserId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setCartStored(false);

            try {
                const cartData = await CartService.getCartData(currentUserId); 

                localStorage.setItem('cartData', JSON.stringify(cartData));
                console.log('Lưu cartData thành công vào localStorage:', cartData);
                setCartStored(true);
            } catch (err) {
                console.error('Failed khi lưu cartData vào localStorage:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndStoreCart();
    }, [currentUserId]);

    return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            <h1>Giỏ hàng của tôi</h1>
            {error && <p style={{ color: 'red' }}>Error: {error.message || 'Lỗi không xác định.'}</p>}
            {!loading && !error && cartStored && (
                <p style={{ color: 'green', fontWeight: 'bold' }}>Dữ liệu giỏ hàng đã được lưu thành công vào Local Storage!</p>
            )}
            {!loading && !error && !cartStored && !error && (
                <p style={{ color: 'orange' }}>Không có dữ liệu giỏ hàng.</p>
            )}

            
            <Button
              onClick={() => navigate('/order')}
              variant="primary"
            >
              THANH TOÁN
            </Button>

        </div>
    );
};

export default CartPage;