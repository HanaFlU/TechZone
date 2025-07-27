import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CartService from '../services/CartService';
import ShippingService from '../services/ShippingRate';
import Button from '../components/button/Button';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import NotificationContainer from '../components/button/NotificationContainer';
import Breadcrumb from '../components/Breadcrumb';
import { Link } from 'react-router-dom';
import useAuthUser from '../hooks/useAuthUser';
import useNotification from '../hooks/useNotification';
import LoginModal from '../components/auth/LoginModal';
import { useStockValidation } from '../hooks/useStockValidation';
const CartPage = () => {
    const {
        notifications,
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
    const [showLoginModal, setShowLoginModal] = useState(false);
    const navigate = useNavigate();

    // Transfer guest cart to user account
    const transferGuestCartToUser = async () => {
        if (!currentUserId) return;
        
        try {
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            if (guestCart.length === 0) return;

            console.log('Starting guest cart transfer:', { guestCart, currentUserId });

            // Convert guest cart format to match backend expectations
            const guestCartItems = guestCart.map(item => ({
                productId: item.product._id,
                quantity: item.quantity
            }));

            const result = await CartService.transferGuestCartToUser(currentUserId, guestCartItems);
            
            if (result.success) {
                displayNotification(result.message, 'success');
                
                // Show warnings if any
                if (result.warnings && result.warnings.length > 0) {
                    result.warnings.forEach(warning => {
                        displayNotification(warning, 'warning');
                    });
                }
                
                // Clear guest cart after successful transfer
                localStorage.removeItem('guestCart');
                console.log('Guest cart cleared from localStorage');
                
                // Update cart data with the result
                if (result.cartData) {
                    setCartData(result.cartData);
                    
                    // Initialize selectedItems
                    const initialSelected = {};
                    if (result.cartData && result.cartData.items) {
                        result.cartData.items.forEach(item => {
                            initialSelected[item.product._id] = true;
                        });
                    }
                    setSelectedItems(initialSelected);
                }
                
                // Dispatch cart updated event
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (err) {
            console.error('Failed to transfer guest cart:', err);
            displayNotification('Không thể chuyển sản phẩm vào tài khoản!', 'error');
        }
    };

    // Stock validation hook
    const { validateStockForQuantityUpdate } = useStockValidation(displayNotification);

    // Fetch cartData for logged-in or guest user
    useEffect(() => {
        const fetchCart = async () => {
            setError(null);
            if (currentUserId) {
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
            } else {
                // Guest: load from localStorage
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                // Convert guestCart to the same structure as user cartData
                const items = guestCart.map(item => ({
                    product: item.product,
                    quantity: item.quantity
                }));
                setCartData({ items });
                // Initialize selectedItems
                const initialSelected = {};
                items.forEach(item => {
                    initialSelected[item.product._id] = true;
                });
                setSelectedItems(initialSelected);
            }
        };
        fetchCart();
    }, [currentUserId]);

    // Transfer guest cart when user logs in
    useEffect(() => {
        if (currentUserId) {
            transferGuestCartToUser();
        }
    }, [currentUserId]);

    // Handle successful login
    const handleSuccessfulLogin = () => {
        setShowLoginModal(false);
        // Refresh the page to ensure all components are updated with new user state
        window.location.reload();
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        console.log('handleQuantityChange called:', { productId, newQuantity });
        if (!cartData) return;
        if (newQuantity < 1) return;
        
        // Find the product to check stock
        const cartItem = cartData.items.find(item => item.product._id === productId);
        if (!cartItem) {
            console.log('Cart item not found for productId:', productId);
            return;
        }
        
        console.log('Cart item found:', cartItem);
        console.log('Stock validation:', {
            newQuantity,
            productStock: cartItem.product.stock,
            willExceed: newQuantity > cartItem.product.stock
        });
        
        // Validate stock using the hook
        if (!validateStockForQuantityUpdate(cartItem.product, newQuantity)) {
            return;
        }
        
        console.log('Stock validation passed, proceeding with update...');
        displayNotification('Cập nhật số lượng thành công!', 'success');
        setError(null);
        if (currentUserId && cartData._id) {
            // Logged-in user: update via CartService
            try {
                const updatedCart = await CartService.updateCartItemQuantity(cartData._id, productId, newQuantity);
                setCartData(updatedCart.cart);
                // Dispatch event to update navbar cart
                window.dispatchEvent(new Event('cartUpdated'));
            } catch (err) {
                if (err.response?.data?.message) {
                    displayNotification(err.response.data.message, 'error');
                } else {
                    displayNotification('Cập nhật số lượng thất bại!', 'error');
                }
                setError(err);
            }
        } else {
            // Guest: update localStorage
            let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            guestCart = guestCart.map(item =>
                item.product._id === productId ? { ...item, quantity: newQuantity } : item
            );
            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            // Update state
            const items = guestCart.map(item => ({ product: item.product, quantity: item.quantity }));
            setCartData({ items });
            // Dispatch event to update navbar cart
            window.dispatchEvent(new Event('cartUpdated'));
        }
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const handleRemoveItem = async (productId) => {
        if (!cartData) return;
        displayNotification('Xóa sản phẩm thành công!', 'success');
        setError(null);
        if (currentUserId && cartData._id) {
            // Logged-in user: update via CartService
            try {
                const updatedCart = await CartService.removeCartItem(cartData._id, productId);
                setCartData(updatedCart.cart);
                setSelectedItems(prev => {
                    const newState = { ...prev };
                    delete newState[productId];
                    return newState;
                });
                // Dispatch event to update navbar cart
                window.dispatchEvent(new Event('cartUpdated'));
            } catch (err) {
                displayNotification('Xóa sản phẩm thất bại!', 'error');
                setError(err);
            }
        } else {
            // Guest: update localStorage
            let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            guestCart = guestCart.filter(item => item.product._id !== productId);
            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            // Update state
            const items = guestCart.map(item => ({ product: item.product, quantity: item.quantity }));
            setCartData({ items });
            setSelectedItems(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
            // Dispatch event to update navbar cart
            window.dispatchEvent(new Event('cartUpdated'));
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

        // Check if user is logged in
        if (!currentUserId) {
            setShowLoginModal(true);
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

    // Only show error if there is a real error (not just 'not logged in')
    if (error) {
        return <div className="text-center py-10 text-red-500">Lỗi: {error.message || 'Lỗi không xác định.'}</div>;
    }

    if (!cartData || !cartData.items || cartData.items.length === 0) {
        return (
            <div className="text-center py-10">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Giỏ hàng của bạn đang trống!</h1>
                <p className="text-lg text-gray-600">Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm.</p>
                <Button className="mt-6" variant="primary" onClick={() => navigate('/')}>Tiếp tục mua sắm</Button>
            </div>
        );
    }

    const allItemsSelected = cartData.items.every(item => selectedItems[item.product._id]);

    return (
        <div className="container mx-auto px-8 py-2 font-sans">
            <Breadcrumb items={[{ label: "Giỏ hàng" }]} />
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Giỏ hàng của tôi</h1>
            <NotificationContainer
                notifications={notifications}
                onClose={closeNotification}
            />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 text-gray-800 text-base">
                {/* Left side */}
                <div className="lg:col-span-3 bg-white rounded-lg h-fit space-y-5">
                    {/* Navbar */}
                    <div className="grid grid-cols-12 gap-4 items-center text-center text-sm font-medium px-4 py-2 border-b-2 border-[#F6F6F6]">
                        <div className="flex items-center col-span-6">
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
                        <div className="col-span-2">Đơn giá</div>
                        <div className="col-span-2">Số lượng</div>
                        <div className="col-span-2">Thành tiền</div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div>
                        {cartData.items.map((item) => (
                            <div key={item.product._id} className="grid grid-cols-12 gap-4 items-start text-center font-medium pb-4 px-4">
                                {/* Col-1 */}
                                <div className="flex items-center col-span-6">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded mr-4 flex-shrink-0"
                                        checked={selectedItems[item.product._id] || false}
                                        onChange={() => handleToggleSelectItem(item.product._id)}
                                    />
                                    <img
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        className="w-16 h-16 object-cover flex-shrink-0"
                                    />
                                    <div className="text-start pl-2 flex-1 min-w-0">
                                        <Link to={`/product/${item.product._id}`} className="text-sm line-clamp-2 hover:text-emerald-600">
                                            {item.product.name}
                                        </Link>
                                        <span className="text-xs text-secondary font-normal">
                                            Chỉ còn {item.product.stock} sản phẩm
                                        </span>
                                    </div>
                                </div>
                                {/* Col-2 */}
                                <div className="col-span-2"><p>{item.product.price.toLocaleString('vi-VN')}₫</p></div>
                                {/* Col-3 */}
                                <div className="col-span-2">
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
                                <div className="col-span-2">
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
            
            {/* Login Modal for guest users */}
            {showLoginModal && (
                <LoginModal 
                    onClose={handleSuccessfulLogin}
                    onSwitch={() => setShowLoginModal(false)}
                />
            )}
        </div>
    );
};

export default CartPage;