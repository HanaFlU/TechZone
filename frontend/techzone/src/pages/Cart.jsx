import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CartService from '../services/CartService';
import ShippingService from '../services/ShippingRate';
import Button from '../components/button/Button';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Notification from '../components/button/Notification';
import Breadcrumb from '../components/Breadcrumb';
import { Link } from 'react-router-dom';
import useAuthUser from '../hooks/useAuthUser';
import useNotification from '../hooks/useNotification';
const CartPage = () => {
    const {
        notificationMessage, 
        notificationType, 
        showNotification, 
        displayNotification, 
        closeNotification
    } = useNotification();
    const [error, setError] = useState(null);

    const {
        currentUserId, 
        authError, 
        isAuthLoading
    } = useAuthUser();
    const [cartData, setCartData] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [shippingFee, setShippingFee] = useState(20000);
    const navigate = useNavigate();

    // Fetch cartData
    useEffect(() => {
        const fetchCart = async () => {
            if (!currentUserId) return;
            
            setError(null);
            try {
                const data = await CartService.getCartData(currentUserId);
                setCartData(data);
                // Initialize selectedItems with the current cart items
                const initialSelected = {};
                if (data && data.items) {
                    data.items.forEach(item => {
                        initialSelected[item.product._id] = true;
                    });
                }
                setSelectedItems(initialSelected);
            } catch (err) {
                console.error('Failed to fetch cart data:', err);
                setError(err);
            }
        };

        fetchCart();
    }, [currentUserId]);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (!currentUserId || !cartData || !cartData._id) return;

        if (newQuantity < 1) return;
        displayNotification('Cập nhật số lượng thành công!', 'success');
        setError(null);
        try {
            const updatedCart = await CartService.updateCartItemQuantity(cartData._id, productId, newQuantity);
            setCartData(updatedCart.cart);
        } catch (err) {
            displayNotification('Cập nhật số lượng thất bại!', 'error');
            setError(err);
        }
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const handleRemoveItem = async (productId) => {
        if (!currentUserId || !cartData || !cartData._id) return;
        displayNotification('Xóa sản phẩm thành công!', 'success');
        setError(null);
        try {
            const updatedCart = await CartService.removeCartItem(cartData._id, productId);
            setCartData(updatedCart.cart);
            setSelectedItems(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
        } catch (err) {
            displayNotification('Xóa sản phẩm thất bại!', 'error');
            setError(err);
        }
    };

    const handleToggleSelectItem = (productId) => {
        setSelectedItems(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    // Bỏ chọn tất cả sản phẩm
    const handleToggleSelectAll = () => {
        const allSelected = Object.values(selectedItems).every(Boolean);
        const newSelectedState = {};
        if (cartData && cartData.items) {
            cartData.items.forEach(item => {
                newSelectedState[item.product._id] = !allSelected;
            });
        }
        setSelectedItems(newSelectedState);
    };

    // Tính toán tổng tiền của các sản phẩm đã chọn
    const calculateTotalPrice = useMemo(() => {
        if (!cartData || !cartData.items) return 0;
        return cartData.items.reduce((total, item) => {
            if (selectedItems[item.product._id]) {
                return total + (item.product.price * item.quantity);
            }
            return total;
        }, 0);
    }, [cartData, selectedItems]);

    useEffect(() => {
        const fetchShippingFee = async () => {
            const token = localStorage.getItem('token');
            const orderValue = calculateTotalPrice;
            console.log(`Đang truy cập API phí vận chuyển: ${import.meta.env.VITE_API_URL}/shipping-rate/get-fee?orderValue=${orderValue}`);
            try {
                const fee = await ShippingService.getShippingFee(orderValue, token);
                setShippingFee(fee);
            } catch {
                setShippingFee(80000);
            }
        };
        if (calculateTotalPrice > 0) fetchShippingFee();
    }, [calculateTotalPrice]);


    const handleCheckout = () => {
        if (!cartData || !cartData.items || Object.values(selectedItems).every(s => !s)) {
            setError({ message: "Vui lòng chọn ít nhất một sản phẩm để thanh toán." });
            return;
        }

        const itemsToCheckout = cartData.items.filter(item => selectedItems[item.product._id]);
        
        const checkoutCart = {
            customer: cartData.customer,
            items: itemsToCheckout
        };

        localStorage.setItem('checkoutData', JSON.stringify(checkoutCart));
        console.log('Lưu các sản phẩm đã chọn vào localStorage cho trang Thanh toán:', checkoutCart);
        navigate('/order');
    };

    if (isAuthLoading) {
        return <div className="text-center py-10">Đang kiểm tra trạng thái đăng nhập...</div>;
    }

    if (authError) {
        return (
            <div className="text-center text-red-600 py-10">
                <h2 className="text-xl font-bold mb-4">Lỗi xác thực!</h2>
                <p>{authError}</p>
                <Button onClick={() => navigate('/login')} variant="primary" className="mt-4">
                    Đăng nhập ngay
                </Button>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">Lỗi: {error.message || 'Lỗi không xác định.'}</div>;
    }

    if (!cartData || !cartData.items || cartData.items.length === 0) {
        return (
            <div className="text-center py-10">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Giỏ hàng của bạn đang trống!</h1>
                <p className="text-lg text-gray-600">Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm.</p>
                <Button className="mt-6" variant="primary" onClick={() => navigate('/')}>
                    Tiếp tục mua sắm
                </Button>
            </div>
        );
    }

    const allItemsSelected = cartData.items.every(item => selectedItems[item.product._id]);

    return (
        <div className="container mx-auto px-8 py-2 font-sans">
            <Breadcrumb items={[{ label: "Giỏ hàng" }]} />
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Giỏ hàng của tôi</h1>
            {showNotification && (
                <Notification
                    message={notificationMessage}
                    type={notificationType}
                    onClose={closeNotification}
                />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 text-gray-800 text-base">
                {/* Left side */}
                <div className="lg:col-span-3 bg-white rounded-lg h-fit space-y-5">
                    {/* Navbar */}
                    <div className="grid grid-cols-5 gap-4 items-center text-center text-sm font-medium px-4 py-2 border-b-2 border-[#F6F6F6]">
                        <div className="flex items-center col-span-2">
                            <input
                                type="checkbox"
                                className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 rounded mr-3"
                                checked={allItemsSelected && cartData.items.length > 0}
                                onChange={handleToggleSelectAll}
                            />
                            <label className="cursor-pointer" onClick={handleToggleSelectAll}>
                                Chọn tất cả ({cartData.items.length} sản phẩm)
                            </label>
                        </div>
                        <div>Đơn giá</div>
                        <div>Số lượng</div>
                        <div>Thành tiền</div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div>
                        {cartData.items.map((item) => (
                            <div key={item.product._id} className="grid grid-cols-5 gap-4 items-start text-center font-medium pb-4 px-4">
                                {/* Col-1 */}
                                <div className="flex items-center col-span-2">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 rounded"
                                        checked={selectedItems[item.product._id] || false}
                                        onChange={() => handleToggleSelectItem(item.product._id)}
                                    />
                                    <img
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        className="w-16 h-16 object-cover"
                                    />
                                    <div className="text-start pl-2">
                                        <Link to={`/products/${item.product._id}`} className="text-sm line-clamp-2 hover:text-emerald-600">
                                            {item.product.name}
                                        </Link>
                                        <span className="text-xs text-secondary font-normal">
                                            Chỉ còn {item.product.stock} sản phẩm
                                        </span>
                                    </div>
                                </div>
                                {/* Col-2 */}
                                <div><p>{item.product.price.toLocaleString('vi-VN')}₫</p></div>
                                {/* Col-3 */}
                                <div>
                                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                                        <button
                                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors duration-200"
                                        >
                                            <MinusIcon className="h-5 w-5" />
                                        </button>
                                        <span className="w-24 text-gray-800 font-medium border-l border-r border-gray-300 py-1">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                            disabled={item.quantity >= item.product.stock}
                                            className="p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors duration-200"
                                        >
                                            <PlusIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <Button
                                        variant=""
                                        className="flex items-center justify-center text-sm text-rose-600"
                                        onClick={() => handleRemoveItem(item.product._id)}
                                    >
                                        <TrashIcon className="h-4 w-4 mr-1" /> Xóa
                                    </Button>
                                </div>
                                {/* Col-4 */}
                                <div>
                                    <p className="font-bold text-light-green">
                                        {(item.product.price * item.quantity).toLocaleString('vi-VN')}₫
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Right side */}
                <div className="lg:col-span-1 bg-white rounded-lg h-fit items-center text-center text-sm">
                    <div className=" font-medium px-4 py-2 border-b-2 border-[#F6F6F6]">
                        Thanh toán
                    </div>
                    <div className="px-4 py-4 grid gap-2">
                        <div className="flex justify-between items-center">
                            <p className="font-medium">Tổng tạm tính</p>
                            <span className="text-base">{calculateTotalPrice.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="font-medium">Phí vận chuyển</p>
                            {shippingFee === 0 ? (
                                <span className="font-medium text-dark-green text-shadow-lg">FREE</span>
                                ) : (
                                    <span className="font-medium">{shippingFee.toLocaleString('vi-VN')}₫</span>
                            )}
                        </div>
                        <div className="flex justify-between">
                            <p className="font-medium items-start">Thành tiền</p>
                            <div>
                                <span className="text-base text-light-green font-bold">{(calculateTotalPrice + shippingFee).toLocaleString('vi-VN')}₫</span>
                                <p className="text-xs text-secondary pt-1">(Đã bao gồm VAT)</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleCheckout}
                            variant="primary"
                            disabled={Object.values(selectedItems).every(s => !s)}
                            className="mt-4"
                        >
                            THANH TOÁN
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;