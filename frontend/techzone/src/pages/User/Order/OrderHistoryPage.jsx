import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import OrderService from "../../../services/OrderService";
import Button from "../../../components/button/Button";
import DetailOrder from "./DetailOrderHistory";
import { ClockIcon } from "@heroicons/react/24/outline";

const OrderHistoryPage = () => {
  const { customerId } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format thời gian
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Format ngày
  const formatDateOnly = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case "PENDING": return "Chờ xác nhận";
      case "CONFIRMED": return "Đã xác nhận";
      case "SHIPPED": return "Đang giao hàng";
      case "DELIVERED": return "Đã giao hàng";
      case "CANCELLED": return "Đã hủy";
      default: return status;
    }
  };

  const getPaymentMethodDisplayName = (method) => {
    switch (method) {
      case "COD": return "Thanh toán khi nhận hàng";
      case "CREDIT_CARD": return "Thẻ tín dụng/Ghi nợ";
      case "E_WALLET": return "Ví điện tử";
      default: return method;
    }
  };

  // Lấy danh sách đơn hàng của customer
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await OrderService.api.get(`/customer/${customerId}`);
        setOrders(res.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    if (customerId) fetchOrders();
  }, [customerId]);

  // Lấy chi tiết đơn hàng khi chọn
  const handleViewDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await OrderService.api.get(`/${orderId}`);
      setSelectedOrder(res.data.order); // Backend trả về { order: <order_object> }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải chi tiết đơn hàng.");
    } finally {
      setDetailLoading(false);
    }
  };
   const handleCloseDetail = () => {
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    return order.status.toLowerCase() === activeTab;
  });

  return (
    <div>
      <div>
        {selectedOrder ? ( // Kiểm tra nếu có selectedOrder thì hiển thị DetailOrder
          <DetailOrder
            selectedOrder={selectedOrder}
            onClose={handleCloseDetail} // Truyền hàm để đóng chi tiết và quay lại
            formatCurrency={formatCurrency}
            formatTime={formatTime}
            formatDateOnly={formatDateOnly}
            getStatusDisplayName={getStatusDisplayName}
            getPaymentMethodDisplayName={getPaymentMethodDisplayName}
          />
        ) : (
        <>
        <div className="pb-4">
          <div className="flex flex-wrap text-base text-center" role="tablist">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ xác nhận" },
              { key: "shipped", label: "Đang giao hàng" },
              { key: "delivered", label: "Đã giao hàng" },
              { key: "cancelled", label: "Đã hủy" },
            ].map((tab) => {
              const baseClasses = "inline-block px-4 mr-2";
              const activeClasses = "text-light-green border-light-green border-b-2 font-medium";
              const inactiveClasses = "hover:border-b-2 hover:border-emerald-500/20";

              const combinedClasses = `${baseClasses} ${
                activeTab === tab.key ? activeClasses : inactiveClasses
              }`;

              return (
                <button
                  key={tab.key}
                  className={combinedClasses}
                  onClick={() => setActiveTab(tab.key)}
                  role="tab"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>


        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                Bạn chưa có đơn hàng nào trong mục này.
              </div>
            ) : (
              filteredOrders.map((order) => (
              <div
                onClick={() => handleViewDetail(order._id)}
                disabled={detailLoading}
                key={order._id} 
                className=" rounded-lg p-4 shadow-sm"
              >
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center pb-2 border-b border-gray-200 mb-4">
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDateOnly(order.createdAt)}
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="mr-8 text-gray-800">Mã đơn hàng: <span className="font-medium">{order.orderId}</span></span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${order.status === "DELIVERED" ? "bg-green-100/50 text-light-green"
                          : order.status === "SHIPPED" ? "bg-blue-100 text-blue-700"
                          : order.status === "CONFIRMED" ? "bg-purple-100 text-purple-700"
                          : order.status === "PENDING" ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {getStatusDisplayName(order.status)}
                    </span>
                  </div>
                </div>

                {/* Danh sách sản phẩm trong đơn hàng */}
                {order.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="grid grid-cols-[auto_1fr_auto] gap-4 items-center py-2 text-sm"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                      <img
                        src={item.product?.images && item.product.images.length > 0 ? item.product.images[0] : "/path/to/default-product-image.png"}
                        alt={item.product?.name || "Sản phẩm"}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.product?.name || "Sản phẩm không xác định"}</p>
                      <p className="text-xs text-gray-500">Phân loại: {item.product?.variants?.map(v => typeof v === 'object' ? v.value : v).join(', ') || 'N/A'}</p>
                      <p className="text-xs text-gray-600">Số lượng: {item.quantity} x {formatCurrency(item.priceAtOrder)}</p>
                    </div>
                    <div className="text-right font-medium text-gray-800">
                      {formatCurrency(item.quantity * item.priceAtOrder)}
                    </div>
                  </div>
                ))}
                <p className="text-right pt-4">
                  <span className="font-medium">Thành tiền:</span>
                  <span className="text-xl text-light-green ml-4 font-semibold">{formatCurrency(order.totalAmount)}</span>
                </p>
              </div>
              ))
            )}
          </div>
        )}

        </>
        )}
      </div>
        
    </div>
  );
};
export default OrderHistoryPage;