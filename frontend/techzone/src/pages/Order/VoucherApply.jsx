import React, { useState, useCallback } from 'react';
import VoucherService from '../../services/VoucherService';

const VoucherApply = ({ 
  subtotal, 
  customerId, 
  onVoucherApplied,
  appliedVoucher,
  displayNotification
}) => {
  
  const [voucherCodeInput, setVoucherCodeInput] = useState('');

  const handleApplyVoucher = useCallback(async () => {
    if (!voucherCodeInput) {
      displayNotification("Vui lòng nhập mã voucher.", "warning");
      return;
    }
    if (!customerId) {
      displayNotification("Không tìm thấy thông tin khách hàng để áp dụng voucher.", "error");
      return;
    }

    if (subtotal <= 0) {
      displayNotification("Giỏ hàng của bạn trống hoặc tổng tiền không hợp lệ.", "warning");
      return;
    }

    try {
      const res = await VoucherService.applyVoucher(voucherCodeInput, subtotal, customerId);
      if (res.success) {
        const { voucher, discountAmount } = res.data;
        onVoucherApplied(voucher, discountAmount);
        displayNotification(`Áp dụng voucher thành công: ${res.data.discountAppliedDescription}`, "success");
      } else {
        onVoucherApplied(null, 0);
        displayNotification(res.message || "Lỗi không xác định khi áp dụng voucher.", "error");
      }
    } catch {
      onVoucherApplied(null, 0);
      displayNotification("Không thể áp dụng voucher.", "error");
    }
  }, [voucherCodeInput, subtotal, customerId, displayNotification, onVoucherApplied]);

  const handleRemoveVoucher = () => {
    onVoucherApplied(null, 0);
    setVoucherCodeInput('');
    displayNotification("Voucher đã được hủy.", "info");
  };

  return (
    <div className="bg-white p-8 pt-4 rounded-lg">
      <h2 className="mb-4 text-lg text-gray-800 font-bold">Mã Voucher</h2>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Nhập mã voucher"
          value={voucherCodeInput}
          onChange={(e) => setVoucherCodeInput(e.target.value)}
          className="flex-grow p-3 bg-gray-300/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
        />
        <button 
          onClick={handleApplyVoucher}
          className="bg-white text-light-green font-medium border-2 border-light-green px-6 py-2 rounded-lg  hover:bg-emerald-700 hover:text-white transition-colors"
        >
          ÁP DỤNG
        </button>
      </div>
      {appliedVoucher && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          <p className="font-semibold">Voucher đã áp dụng: {appliedVoucher.code}</p>
          <p>{appliedVoucher.description}</p>
          <button
            onClick={handleRemoveVoucher}
            className="text-red-500 hover:text-red-700 mt-2 text-xs"
          >
            Hủy voucher
          </button>
        </div>
      )}
    </div>
  );
};

export default VoucherApply;