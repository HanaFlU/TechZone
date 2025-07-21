import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import OrderService from "../../services/OrderService";
import Button from "../../components/button/Button";

const OrderHistoryPage = () => {
  const { customerId } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const order = await OrderService.getOrderById(orderId);
      setSelectedOrder(order);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải chi tiết đơn hàng.");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-gray-800">Lịch sử đơn hàng</h1>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Mã đơn</th>
                <th className="p-2 border">Ngày đặt</th>
                <th className="p-2 border">Tổng tiền</th>
                <th className="p-2 border">Trạng thái</th>
                <th className="p-2 border"></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4">Bạn chưa có đơn hàng nào.</td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{order.orderId}</td>
                  <td className="p-2 border">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="p-2 border">{order.totalAmount?.toLocaleString()}₫</td>
                  <td className="p-2 border">{order.status}</td>
                  <td className="p-2 border">
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetail(order._id)}
                      disabled={detailLoading}
                    >
                      Xem chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hiển thị chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black opacity-40" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 z-50 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              title="Đóng"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">Chi tiết đơn hàng</h2>
            <div className="mb-2"><b>Mã đơn:</b> {selectedOrder.orderId}</div>
            <div className="mb-2"><b>Ngày đặt:</b> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
            <div className="mb-2"><b>Trạng thái:</b> {selectedOrder.status}</div>
            <div className="mb-2"><b>Phương thức thanh toán:</b> {selectedOrder.paymentMethod}</div>
            <div className="mb-2"><b>Tổng tiền:</b> {selectedOrder.totalAmount?.toLocaleString()}₫</div>
            <div className="mb-2"><b>Địa chỉ giao hàng:</b> {selectedOrder.shippingAddress}</div>
            <div className="mb-2"><b>Sản phẩm:</b>
              <ul className="list-disc ml-6">
                {selectedOrder.items?.map((item, idx) => (
                  <li key={idx}>
                    {item.product} - SL: {item.quantity} - Giá: {item.priceAtOrder?.toLocaleString()}₫
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;