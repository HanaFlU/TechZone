import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const DetailOrder = ({
  selectedOrder,
  onClose,
  formatCurrency,
  formatTime,
  formatDateOnly,
  getStatusDisplayName,
  getPaymentMethodDisplayName,
}) => {
  if (!selectedOrder) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 border-b border-gray-200">
        <button
          onClick={onClose}
          className="flex items-center text-secondary hover:text-emerald-700 p-2 -ml-2 transition-colors"
          title="Quay lại danh sách đơn hàng"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          <span>Trở về</span>
        </button>
        <div className="flex items-center">
          <span className="mr-8 text-gray-800">Mã đơn hàng: <span className="font-medium">{selectedOrder.orderId}</span></span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold
            ${selectedOrder.status === "DELIVERED" ? "bg-green-100 text-green-700" :
            selectedOrder.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
            selectedOrder.status === "CONFIRMED" ? "bg-purple-100 text-purple-700" :
            selectedOrder.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
            }`}
          >
            {getStatusDisplayName(selectedOrder.status).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Thông tin địa chỉ giao hàng và Lịch sử trạng thái */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div>
          <p className="text-xl font-semibold mb-3">Địa chỉ giao hàng</p>
          <div className="space-y-2 text-gray-700 text-sm">
            <p><strong>Họ tên:</strong> {selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
            <p><strong>Số điện thoại:</strong> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
            <p>
              <strong>Địa chỉ:</strong>
              {selectedOrder.shippingAddress?.street || 'N/A'}
              {selectedOrder.shippingAddress?.ward ? `, ${selectedOrder.shippingAddress.ward}` : ''}
              {selectedOrder.shippingAddress?.district ? `, ${selectedOrder.shippingAddress.district}` : ''}
              {selectedOrder.shippingAddress?.city ? `, ${selectedOrder.shippingAddress.city}` : ''}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xl font-semibold mb-3">Lịch sử trạng thái</p>
          {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
              <ol className="relative ml-4">
              {[...selectedOrder.statusHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((s, idx) => (
                  <li key={idx} className="grid grid-cols-[auto_1fr] gap-x-4 items-start pb-4">
                      <div className="flex flex-col items-center">
                          {/* Dấu chấm/icon */}
                          <div className="flex-shrink-0">
                              <CheckCircleIcon className="w-5 h-5 text-emerald-500 bg-white rounded-full" />
                          </div>
                          {/* Đường kẻ (nếu không phải item cuối cùng) */}
                          {idx < selectedOrder.statusHistory.length - 1 && (
                              <div className="w-0.5 bg-gray-200 flex-grow mt-2 -mb-2"></div>
                          )}
                      </div>
                      {/* Cột 2: Thời gian và nội dung trạng thái */}
                      <div>
                          <time className="block text-sm font-normal leading-none text-gray-500 mb-1">
                              {formatTime(s.timestamp)} {formatDateOnly(s.timestamp)}
                          </time>
                          <h4 className="text-base font-semibold text-gray-900">
                              {getStatusDisplayName(s.status)}
                          </h4>
                          {s.status === "DELIVERED" && <p className="text-sm text-gray-600">Giao hàng thành công!</p>}
                          {s.status === "SHIPPED" && <p className="text-sm text-gray-600">Đang giao hàng</p>}
                          {s.status === "CONFIRMED" && <p className="text-sm text-gray-600">Đơn hàng đã được xác nhận thành công! Đang trong quá trình vận chuyển</p>}
                          {s.status === "PENDING" && <p className="text-sm text-gray-600">Đơn hàng đã đặt thành công! Vui lòng chờ xác nhận đơn hàng từ cửa hàng.</p>}
                      </div>
                  </li>
              ))}
              </ol>
          ) : (
              <p className="text-gray-600">Không có lịch sử trạng thái để hiển thị.</p>
          )}
        </div>
      </div>

        {/* Danh sách sản phẩm */}
        <div className="mb-6">
            <p className="text-xl font-semibold mb-3 text-gray-800">Danh sách sản phẩm</p>
            {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex items-center py-3 border-t border-gray-100 first:border-t-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center mr-4">
                        <img
                        src={item.product?.images && item.product.images.length > 0 ? item.product.images[0] : "/path/to/default-product-image.png"}
                        alt={item.product?.name || "Sản phẩm"}
                        className="object-cover w-full h-full"
                        />
                    </div>
                    <div className="flex-grow">
                        <p className="font-medium text-gray-800">{item.product?.name || "Sản phẩm không xác định"}</p>
                        <p className="text-sm text-gray-500">Phân loại: {item.product?.variants?.map(v => typeof v === 'object' ? v.value : v).join(', ') || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right font-semibold text-gray-800">
                        {formatCurrency(item.priceAtOrder)}
                    </div>
                </div>
            ))}
        </div>

        {/* Tóm tắt thanh toán */}
        <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex justify-between text-gray-700 mb-2">
                <span>Tổng tiền hàng:</span>
                <span>{formatCurrency(selectedOrder.totalAmount - (selectedOrder.shippingFee?.amount || selectedOrder.shippingFee || 0))}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-2">
                <span>Phí vận chuyển:</span>
                <span>{formatCurrency(selectedOrder.shippingFee?.amount || selectedOrder.shippingFee || 0)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-emerald-600">
                <span>Thành tiền:</span>
                <span>{formatCurrency(selectedOrder.totalAmount)}</span>
            </div>
            <div className="flex justify-end mt-4 text-sm text-gray-600">
                <span>Phương thức thanh toán: <span className="font-semibold text-gray-800">{getPaymentMethodDisplayName(selectedOrder.paymentMethod)}</span></span>
            </div>
        </div>
    </div>
  );
};

export default DetailOrder;