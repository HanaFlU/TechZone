import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderService from '../../services/OrderService';
import CustomerService from '../../services/CustomerService';
import PaymentService from '../../services/PaymentService';
import ShippingService from '../../services/ShippingRate';
import AddressForm from '../User/Address/AddressForm';

import Breadcrumb from '../../components/Breadcrumb';
import Button from '../../components/button/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import Notification from '../../components/button/Notification';
import useNotification from '../../hooks/useNotification';
import StripeWrapper from './Payment';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const OrderForm = () => {
  const navigate = useNavigate();
  const {
    notificationMessage, 
    notificationType, 
    showNotification, 
    displayNotification, 
    closeNotification
  } = useNotification();
  const [cartData, setCartData] = useState(null);
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingFee, setShippingFee] = useState(20000);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCustomerId, setActualCustomerId] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      displayNotification('', '');
      try {
        // Lấy dữ liệu giỏ hàng từ localStorage
        const storedCart = localStorage.getItem('checkoutData');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setCartData(parsedCart);
          //Lấy customerId từ cartData
          if (parsedCart && parsedCart.customer) {
            setActualCustomerId(parsedCart.customer);
            const customerDataResponse = await CustomerService.getAddresses(parsedCart.customer);
            if (customerDataResponse.customer && customerDataResponse.customer.shippingAddresses) {
              const addresses = customerDataResponse.customer.shippingAddresses;
              setCustomerAddresses(addresses);

              if (addresses.length > 0) {
                const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0];
                setSelectedAddressId(defaultAddr._id);
              }
            } else {
              setCustomerAddresses([]);
            }
          } else {
            setError({ message: "Không tìm thấy Customer ID trong dữ liệu giỏ hàng." });
            setLoading(false);
            return;
          }
        } else {
          return;
        }

      } catch (err) {
        setError(err.response?.data || { message: "Không thể tải dữ liệu giỏ hàng." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, displayNotification]);

  const calculateTotal = useCallback(() => {
    if (!cartData || !cartData.items) return 0;
    return cartData.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
  }, [cartData]);
  // Hàm tính phí ship
  useEffect(() => {
    const fetchShippingFee = async () => {
      const total = calculateTotal();
      const token = localStorage.getItem('token');
      try {
        const fee = await ShippingService.getShippingFee(total, token);
        setShippingFee(fee);
      } catch {
        setShippingFee(50000);
      }
    };
    if (cartData && cartData.items) fetchShippingFee();
  }, [cartData]);

  const handlePlaceOrder = useCallback(async () => {
    if (!currentCustomerId) {
      displayNotification("Thiếu thông tin người dùng để đặt hàng.", "error");
      return;
    }
    if (!selectedAddressId) {
      displayNotification("Vui lòng chọn địa chỉ giao hàng.", "warning");
      return;
    }
    if (!paymentMethod) {
      displayNotification("Vui lòng chọn phương thức thanh toán.", "warning");
      return;
    }

    const checkoutDataString = localStorage.getItem('checkoutData');
    if (!checkoutDataString) {
      displayNotification("Không tìm thấy dữ liệu thanh toán. Vui lòng quay lại giỏ hàng.", "error");
      return;
    }
    const checkoutData = JSON.parse(checkoutDataString);

    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
      displayNotification("Giỏ hàng trống hoặc dữ liệu thanh toán không hợp lệ! Không thể đặt hàng.", "warning");
      return;
    }
    setPlacingOrder(true);
    try {
      const finalTotalAmount = calculateTotal() + shippingFee;
      const detailedOrderItems = checkoutData.items.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        priceAtOrder: item.product.price
      }));

      let stripeTransactionId = null;
      let finalPaymentStatus = 'PENDING';
      if (paymentMethod === 'CREDIT_CARD') {
        if (!stripe || !elements) {
          displayNotification("Stripe chưa sẵn sàng. Vui lòng thử lại.", "error");
          setPlacingOrder(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          displayNotification("Không tìm thấy thông tin thẻ tín dụng. Vui lòng nhập lại.", "error");
          setPlacingOrder(false);
          return;
        }

        try {
          // Tạo paymentIntent trên Stripe
          const paymentIntentResponse = await PaymentService.createStripePaymentIntent({
            customerId: currentCustomerId,
            shippingAddressId: selectedAddressId,
            amount: finalTotalAmount,
            currency: 'VND'
          });

          if (!paymentIntentResponse.clientSecret) {
            displayNotification(paymentIntentResponse.message || 'Không thể tạo phiên thanh toán Stripe.', 'error');
            setPlacingOrder(false);
            return;
          }

            // Thanh toán trên frontend với clientSecret
          const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
            paymentIntentResponse.clientSecret,
            {
              payment_method: {
                card: cardElement,
                billing_details: {
                  name: "Tên khách hàng",
                  email: "email@example.com",
                },
              },
            }
          );

          if (confirmError) {
            finalPaymentStatus = 'FAILED';
            stripeTransactionId = confirmError.payment_intent ? confirmError.payment_intent.id : null;
            displayNotification(`Thanh toán thất bại: ${confirmError.message}`, 'error');
          } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            finalPaymentStatus = 'SUCCESSED';
            stripeTransactionId = paymentIntent.id;
            displayNotification('Thanh toán thành công! Đang hoàn tất đơn hàng...', 'success');
          } else {
            finalPaymentStatus = 'FAILED';
            stripeTransactionId = paymentIntent ? paymentIntent.id : null;
          }
        } catch (stripeProcessingError) {
          finalPaymentStatus = 'FAILED';
          displayNotification(`Lỗi xử lý thanh toán Stripe: ${stripeProcessingError.message}`, 'error');
        }
      }
      // Tạo Order
      const orderCreationPayload = {
          customerId: currentCustomerId,
          shippingAddressId: selectedAddressId,
          paymentMethod: paymentMethod,
          orderItems: detailedOrderItems,
          totalAmount: finalTotalAmount,
          shippingFee: shippingFee,
          transactionId: stripeTransactionId,
          paymentStatus: finalPaymentStatus,
      };
      
      const orderResponse = await OrderService.createOrder(orderCreationPayload);
      if (orderResponse.order) {
        localStorage.removeItem('checkoutData');
        
        const finalMessage = finalPaymentStatus === 'SUCCESSED' || paymentMethod === 'COD' ? // Thông báo thành công nếu thanh toán thành công hoặc là COD
            'Đơn hàng đã được tạo thành công!' :
            'Đơn hàng đã được ghi nhận nhưng thanh toán thất bại.';
        displayNotification(finalMessage, (finalPaymentStatus === 'SUCCESSED' || paymentMethod === 'COD') ? 'success' : 'error');
        setTimeout(() => {
            navigate('/');
        }, 4000);
      } else {
        displayNotification(orderResponse.message || 'Lỗi khi tạo đơn hàng.', 'error');
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi đặt hàng/thanh toán.';
      displayNotification(errorMessage, 'error');
    } finally {
      setPlacingOrder(false);
    }
  }, [cartData, currentCustomerId, selectedAddressId, paymentMethod, displayNotification, navigate, stripe, elements, calculateTotal, shippingFee, setCartData ]); // Thêm calculateTotal và shippingFee vào dependency array
    
  // Hàm reload địa chỉ sau khi thêm mới thành công
  const reloadAddresses = useCallback(async () => {
    if (currentCustomerId) {
      const res = await CustomerService.getAddresses(currentCustomerId);
      if (res.customer && res.customer.shippingAddresses) {
        setCustomerAddresses(res.customer.shippingAddresses);
      }
    }
  }, [currentCustomerId]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Lỗi đặt hàng!</h2>
        <p>{error.message || 'Lỗi khi đặt hàng.'}</p>
        <p>Vui lòng kiểm tra lại giỏ hàng và thử lại.</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-8 py-8 pt-2 font-sans">
      <Breadcrumb items={[
        { to: "/cart", label: "Giỏ hàng" },
        { label: "Thanh toán" }
      ]} />
      {!cartData || cartData.items.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg">Giỏ hàng của bạn trống hoặc không thể tải được.</p>
          <Button
              onClick={() => navigate('/cart')}
              variant="primary"
            >
              TRỞ VỀ GIỎ HÀNG
            </Button>
        </div>
      ) : (
        <div>
          {showNotification && (
            <Notification
                message={notificationMessage}
                type={notificationType}
                onClose={closeNotification}
            />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Left side */}
            <div className="lg:col-span-3 space-y-5">
              {/* Địa chỉ nhận hàng */}
              <div className="bg-white p-8 pt-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg text-gray-800 font-bold">Địa chỉ nhận hàng</h2>
                </div>
                
                {customerAddresses.length > 0 ? (
                  // Hiển thị danh sách địa chỉ
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-dark-gray text-sm">
                    {[...customerAddresses]
                      .sort((a, b) => {
                        if (a.isDefault && !b.isDefault) return -1;
                        if (!a.isDefault && b.isDefault) return 1;
                        return 0;
                      })
                      .map((address) => (
                        <label
                          key={address._id}
                          className={`block border rounded-lg p-4 cursor-pointer transition-all 
                            ${selectedAddressId === address._id ? 'border-1.5 border-light-green shadow-lg ' : 'border-gray-300 hover:shadow-md'}`}
                          onDoubleClick={() => setEditAddress(address)}
                        >
                          <input
                            type="radio"
                            name="shippingAddress"
                            value={address._id}
                            checked={selectedAddressId === address._id}
                            onChange={() => setSelectedAddressId(address._id)}
                            className="mr-2 accent-emerald-700"
                          />
                          <span className="font-medium text-base">
                            {address.fullName} {address.isDefault && <span className="text-xs text-secondary">(Mặc định)</span>}
                          </span>
                          <p><span className='font-medium'>Số điện thoại:</span> {address.phone}</p>
                          <p><span className='font-medium'>Địa chỉ:</span> {address.street}, {address.district}, {address.city}</p>
                        </label>
                    ))}
                    {editAddress && (
                      <AddressForm
                        isOpen={!!editAddress}
                        onClose={() => setEditAddress(null)}
                        onSaveSuccess={async () => {
                          setEditAddress(null);
                          await reloadAddresses();
                        }}
                        initialAddressData={editAddress}
                        customerId={currentCustomerId}
                      />
                    )}
                    {/* Thêm địa chỉ */}
                    <div
                      className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 cursor-pointer hover:border-emerald-700 hover:text-emerald-700 transition-colors"
                      onClick={() => setShowAddressModal(true)}
                    >
                      <PlusIcon className="h-6 w-6 mr-2" />
                      <span>Thêm địa chỉ</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-red-500 p-4 border rounded-md border-red-300 bg-red-50">
                    <p>Không tìm thấy địa chỉ giao hàng. Vui lòng thêm địa chỉ mới.</p>
                    <div
                      className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 mt-4 text-gray-500 cursor-pointer hover:border-emerald-700 hover:text-emerald-700 transition-colors"
                      onClick={() => setShowAddressModal(true)}
                    >
                      <PlusIcon className="h-6 w-6 mr-2" />
                      <span>Thêm địa chỉ</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal AddressForm */}
              {showAddressModal && (
                <AddressForm
                  isOpen={showAddressModal}
                  onClose={() => setShowAddressModal(false)}
                  onSaveSuccess={async () => {
                    setShowAddressModal(false);
                    await reloadAddresses();
                    if (currentCustomerId) {
                      const res = await CustomerService.getAddresses(currentCustomerId);
                      if (res.customer && res.customer.shippingAddresses) {
                        setCustomerAddresses(res.customer.shippingAddresses);
                        const lastAddress = res.customer.shippingAddresses[res.customer.shippingAddresses.length - 1];
                        if (lastAddress && lastAddress._id) {
                          setSelectedAddressId(lastAddress._id);
                        }
                      }
                    }
                  }}
                  customerId={currentCustomerId}
                />
              )}

              {/* Voucher */}
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
                  <div className="mt-4 p-4 border border-gray-300 rounded-lg">
                    <label htmlFor="card-element" className="block text-base font-medium text-gray-700 mb-2">
                      Thông tin thẻ tín dụng/ghi nợ:
                    </label>
                    <CardElement
                      id="card-element"
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                      }}
                    />
                    <p className="text-xs text-secondary mt-2">
                        Chúng tôi sử dụng Stripe để xử lý thanh toán của bạn một cách an toàn.
                    </p>
                  </div>
                )}
                {paymentMethod === 'E_WALLET' && (
                  <p className="text-sm text-gray-600 mt-4">
                    Bạn sẽ được chuyển hướng đến cổng thanh toán của Ví điện tử để hoàn tất giao dịch.
                  </p>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="lg:col-span-1 bg-white p-8 pt-4 rounded-lg h-fit top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg text-gray-800 font-bold">Thông tin đơn hàng</h2>
                <button className="text-light-green text-sm hover:text-shadow-sm">Sửa</button>
              </div>
        
              {/* Danh sách sản phẩm trong giỏ hàng */}
              <div className="space-y-4 mb-4">
                {cartData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
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
                  {shippingFee === 0 ? (
                    <span className="font-medium text-dark-green text-shadow-lg">FREE</span>
                  ) : (
                    <span className="font-medium">{shippingFee.toLocaleString()}₫</span>
                  )}
                </div>
                <div className="flex justify-between text-sm font-medium items-center pt-2">
                  <span>Thành tiền:</span>
                  <span className='text-lg font-bold text-light-green'>{(calculateTotal() + shippingFee).toLocaleString()}₫</span>
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
        </div>
      )}
    </div>
  );
};

const OrderPage = () => (
    <StripeWrapper>
        <OrderForm />
    </StripeWrapper>
);

export default OrderPage;