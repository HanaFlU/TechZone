import React from 'react'

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderService from '../../services/OrderService';
import CustomerService from '../../services/CustomerService';

import { PlusIcon } from '@heroicons/react/24/outline';

const OrderPage = () => {
  const navigate = useNavigate();
  const currentCustomerId = '6856b816cf118b51cb681322'; //Giả sử khách hàng đã đăng nhập

  const [cartData, setCartData] = useState(null);
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lấy dữ liệu giỏ hàng từ localStorage
        const storedCart = localStorage.getItem('cartData');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setCartData(parsedCart);
        } else {
          console.log("Không tìm thấy dữ liệu giỏ hàng trong localStorage.");
          return;
        }

        // Lấy danh sách địa chỉ của khách hàng
        if (currentCustomerId) {
          const customerDataResponse = await CustomerService.getAddresses(currentCustomerId);
          if (customerDataResponse.customer && customerDataResponse.customer.shippingAddresses) {
            const addresses = customerDataResponse.customer.shippingAddresses;
            setCustomerAddresses(addresses);

            if (addresses.length > 0) {
              const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0];
              setSelectedAddressId(defaultAddr._id);
            }
          } else {
              console.log("Không tìm thấy địa chỉ giao hàng.");
              setCustomerAddresses([]);
          }
        } else {
          setError({ message: "Không tìm thấy currentCustomerId" });
        }

      } catch (err) {
        console.error("Error:", err);
        setError(err.response?.data || { message: "Không thể tải dữ liệu giỏ hàng." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentCustomerId, navigate]);

  const calculateTotal = () => {
    if (!cartData || !cartData.items) return 0;
    return cartData.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const handlePlaceOrder = async () => {
    // Kiểm tra các điều kiện cần thiết trước khi đặt hàng
    if (!currentCustomerId) {
      setError({ message: "Thiếu currentCustomerId." });
      return;
    }
    if (!selectedAddressId) {
      setError({ message: "Vui lòng chọn địa chỉ giao hàng." });
      return;
    }
    if (!paymentMethod) {
      setError({ message: "Vui lòng chọn phương thức thanh toán." });
      return;
    }
    if (!cartData || cartData.items.length === 0) {
      setError({ message: "Giỏ hàng trống! Không thể đặt hàng." });
      return;
    }

    setLoading(true);
    setError(null);
    setOrderSuccess(false);

    try {
      const orderPayload = {
        customerId: currentCustomerId,
        shippingAddressId: selectedAddressId,
        paymentMethod: paymentMethod,
      };

      const response = await OrderService.createOrder(orderPayload);
      console.log('Order successfully: ${response.order.orderId}`', response);
      setOrderSuccess(true);
      
      localStorage.removeItem('cartData');
      setCartData(null);

      alert('Đặt hàng thành công!');

    } catch (err) {
      console.error('Failed order:', err);
      setError(err.response?.data || { message: 'Lỗi khi đặt hàng.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading your order summary and addresses...</div>;
  }

  if (error && !orderSuccess) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Lỗi đặt hàng!</h2>
        <p>{error.message || 'Lỗi khi đặt hàng.'}</p>
        <p>Vui lòng kiểm tra lại giỏ hàng và thử lại.</p>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', color: 'green' }}>
        <h1>Đặt hàng thành công!</h1>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-8 pt-4 font-sans">
      <p className="text-sm mb-4 text-secondary">Breadcrumb</p> {/* Tiêu đề trang */}
      
      {!cartData || cartData.items.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg">Giỏ hàng của bạn trống hoặc không thể tải được.</p>
          <button
            onClick={() => navigate('/cart')}
            className="mt-5 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Đi đến Giỏ hàng
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left side */}
          <div className="lg:col-span-3 space-y-5">
            {/* Địa chỉ nhận hàng */}
            <div className="bg-white p-8 pt-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg text-gray-800 font-bold">Địa chỉ nhận hàng</h2>
              </div>
              
              {customerAddresses.length > 0 ? (
                // Hiển thị danh sách địa chỉ dạng thẻ
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-dark-gray text-sm">
                  {customerAddresses.map((address) => (
                    <label 
                      key={address._id} 
                      className={`block border rounded-lg p-4 cursor-pointer transition-all 
                        ${selectedAddressId === address._id ? 'border-1.5 border-light-green shadow-lg ' : 'border-gray-300 hover:shadow-md'}`}
                    >
                      <input 
                        type="radio" 
                        name="shippingAddress" 
                        value={address._id} 
                        checked={selectedAddressId === address._id} 
                        onChange={() => setSelectedAddressId(address._id)} 
                        className="mr-2 accent-emerald-700"
                      />
                      <span className="font-medium text-base">{address.fullName} {address.isDefault && <span className="text-xs text-secondary">(Mặc định)</span>}</span>
                      <p><span className='font-medium'>Số điện thoại:</span> {address.phone}</p>
                      <p><span className='font-medium'>Địa chỉ:</span> {address.street}, {address.district}, {address.city}</p>
                    </label>
                  ))}
                  {/* Thẻ "Thêm địa chỉ" */}
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 cursor-pointer hover:border-emerald-700 hover:text-emerald-700 transition-colors">
                    <PlusIcon className="h-6 w-6 mr-2" />
                    <span>Thêm địa chỉ</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500 p-4 border rounded-md border-red-300 bg-red-50">
                  <p>Không tìm thấy địa chỉ giao hàng. Vui lòng thêm địa chỉ mới.</p>
                </div>
              )}
            </div>

            {/* Mã Voucher */}
            <div className="bg-white p-8 pt-4 rounded-lg">
              <h2 className="mb-4 text-lg text-gray-800 font-bold">Mã Voucher</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Nhập mã voucher"
                  className="flex-grow p-3 bg-gray-300/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <button className="bg-white text-light-green font-medium border-2 border-light-green px-6 py-2 rounded-lg  hover:bg-emerald-700 hover:text-white transition-colors">
                  ÁP DỤNG
                </button>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white p-8 pt-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg text-gray-800 font-bold">Phương thức thanh toán</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPaymentMethod('COD')}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors
                      ${paymentMethod === 'COD' ? 'bg-white text-light-green font-medium border-2 border-light-green shadow-lg' : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-700 hover:text-white'}`}
                  >
                    Thanh toán khi nhận hàng
                  </button>
                  <button
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`px-3 py-1.5 rounded-md border text-sm transition-colors
                      ${paymentMethod === 'CREDIT_CARD' ? 'bg-white text-light-green font-medium border-2 border-light-green shadow-lg' : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-700 hover:text-white'}`}
                  >
                    Thẻ tín dụng/Ghi nợ
                  </button>
                  <button
                    onClick={() => setPaymentMethod('E_WALLET')}
                    className={`px-3 py-1.5 rounded-md border text-sm transition-colors
                      ${paymentMethod === 'E_WALLET' ? 'bg-white text-light-green font-medium border-2 border-light-green shadow-lg' : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-700 hover:text-white'}`}
                  >
                    Ví điện tử
                  </button>
                </div>
              </div>

              {paymentMethod === 'COD' && (
                <p className="text-sm text-gray-600 mt-4">
                  Vui lòng chuẩn bị đủ {(calculateTotal() + 20000).toLocaleString()}₫ để thanh toán cho nhân viên giao hàng.
                </p>
              )}
              {paymentMethod === 'CREDIT_CARD' && (
                <p className="text-sm text-gray-600 mt-4">
                  Hiển thị input nhập thông tin thẻ tín dụng/ghi nợ.
                </p>
              )}
              {paymentMethod === 'E_WALLET' && (
                <p className="text-sm text-gray-600 mt-4">
                  Bạn sẽ được chuyển hướng đến cổng thanh toán của Ví điện tử để hoàn tất giao dịch.
                </p>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="lg:col-span-1 bg-white p-8 pt-4 rounded-lg h-fit sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg text-gray-800 font-bold">Thông tin đơn hàng</h2>
              <button className="text-light-green text-sm hover:text-shadow-sm">Sửa</button>
            </div>
       
            {/* Danh sách sản phẩm trong giỏ hàng */}
            <div className="space-y-4 mb-4">
              {cartData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product?.name || 'Sản phẩm'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div>
                        Không có hình ảnh sản phẩm
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-sm text-gray-700 line-clamp-2">
                      {item.product?.name || 'Sản phẩm không xác định'}
                    </h4>
                    <span className="text-xs text-secondary"> (x{item.quantity})</span>
                    <p className="text-sm font-bold text-light-green mt-1">
                      {((item.product?.price || 0) * item.quantity).toLocaleString()}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng cộng */}
            <div className="border-t-2 border-[#F6F6F6] pt-4 mt-4 space-y-2 text-gray-700">
              <div className="flex justify-between text-sm">
                <span>Tổng tạm tính:</span>
                <span className="font-medium">{calculateTotal().toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Phí vận chuyển:</span>
                <span className="font-medium">20.000₫</span> {/* Phí vận chuyển giả định */}
              </div>
              <div className="flex justify-between text-sm font-medium items-center pt-2">
                <span>Thành tiền:</span>
                <span className='text-lg font-bold text-light-green'>{(calculateTotal() + 20000).toLocaleString()}₫</span>
              </div>
              <p className="text-xs text-secondary text-right">(Đã bao gồm VAT)</p>
            </div>

            {/* Nút Thanh toán */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading || customerAddresses.length === 0 || !selectedAddressId}
              className={`mt-6 w-full py-3 rounded-lg text-white text-lg font-semibold transition-colors 
                         ${(loading || customerAddresses.length === 0 || !selectedAddressId) 
                           ? 'bg-gray-400 cursor-not-allowed' 
                           : 'bg-light-green hover:bg-emerald-700 hover:shadow-lg'}`}
            >
              {loading ? 'Đang đặt hàng...' : 'THANH TOÁN'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
