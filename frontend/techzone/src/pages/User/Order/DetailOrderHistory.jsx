import React from 'react';
import { ArrowLeftIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

const DetailOrder = ({
  selectedOrder,
  onClose,
  formatCurrency,
  formatTime,
  formatDateOnly,
  getStatusDisplayName,
  getPaymentMethodName,
}) => {
  if (!selectedOrder) return null;
  const initialSubtotal = selectedOrder.items.reduce((sum, item) => {
    return sum + (item.priceAtOrder * item.quantity);
  }, 0);


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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-6">
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
        {/* Lịch sử trạng thái */}
        <div>
          <p className="text-xl font-semibold mb-3">Lịch sử trạng thái</p>
          {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
            <div className="relative pl-2">
              <div className="absolute left-2 mt-1 top-0 bottom-0 w-0.5 bg-gray-100"></div>
              {[...selectedOrder.statusHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((s, idx) => (
                <div key={idx} className="relative mb-4 last:mb-0 flex items-start">
                  <div className="absolute -left-3 p-0.5 rounded-full">
                    <CheckBadgeIcon className="w-5 h-5 text-light-green" />
                  </div>

                  {/* Nội dung trạng thái */}
                  <div className="ml-4 flex-grow">
                    <div className="flex items-center mb-1">
                      <time className="block text-sm font-normal leading-none whitespace-nowrap mr-2">
                        {formatTime(s.timestamp)} {formatDateOnly(s.timestamp)}
                      </time>
                      <h4 className={`text-base font-semibold ${s.status === "DELIVERED" ? "text-light-green" : "text-gray-700"}`}>
                        {getStatusDisplayName(s.status)}
                      </h4>
                    </div>
                    {s.status === "CANCELLED" && <p className="text-sm text-secondary">Đơn hàng đã bị hủy!</p>}
                    {s.status === "DELIVERED" && <p className="text-sm text-secondary">Giao hàng thành công!</p>}
                    {s.status === "SHIPPED" && <p className="text-sm text-secondary">Đang giao hàng</p>}
                    {s.status === "CONFIRMED" && <p className="text-sm text-secondary">Đơn hàng đã được xác nhận thành công! Đang chuẩn bị hàng và chờ vận chuyển</p>}
                    {s.status === "PENDING" && <p className="text-sm text-secondary">Đơn hàng đã đặt thành công! Vui lòng chờ xác nhận đơn hàng từ cửa hàng.</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Không có lịch sử trạng thái để hiển thị.</p>
          )}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div>
        <p className="text-xl font-semibold mb-3 mt-4 text-gray-800">Danh sách sản phẩm</p>
        {selectedOrder.items?.map((item, idx) => (
          <div key={idx} className="flex items-center py-2 border-t border-gray-100 first:border-t-0">
            <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center mr-4">
                <img
                src={item.product?.image || "/default-product-image.png"}
                alt={item.product?.name || "Tên sản phẩm"}
                className="object-cover w-full h-full"
                />
            </div>
            <div className="flex-grow">
                <p className="font-medium text-gray-800">{item.product?.name || "Sản phẩm không xác định"}</p>
                <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
            </div>
            <div className="text-right font-semibold text-gray-800">
                {formatCurrency(item.priceAtOrder)}
            </div>
          </div>
        ))}
      </div>

      {/* Tóm tắt thanh toán */}
      <div className="border-t border-gray-200 pt-4 text-secondary mb-2 pl-[34vw]">
          <div className="flex justify-between">
              <span>Tổng tiền hàng</span>
              <span>{formatCurrency(initialSubtotal)}</span>
          </div>
          {/* Hiển thị Voucher chỉ khi discountAmount > 0 */}
          {selectedOrder.discountAmount > 0 && (
            <div className="flex justify-between">
              <span>Voucher</span>
              <span className="text-emerald-600/70">- {formatCurrency(selectedOrder.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between ">
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(selectedOrder.shippingFee?.amount || selectedOrder.shippingFee || 0)}</span>
          </div>
          <div className="flex justify-between">
              <span>Thành tiền</span>
              <span className="text-xl font-bold text-emerald-600">{formatCurrency(selectedOrder.totalAmount)}</span>
          </div>
          
      </div>
      <div className="flex pl-[34vw] justify-between border-t pt-2 text-secondary border-gray-200">
              <span>Phương thức thanh toán</span>
              <span className="font-semibold text-gray-800">{getPaymentMethodName(selectedOrder.paymentMethod)}</span>
          </div>
    </div>
  );
};

export default DetailOrder;