// server/controllers/VoucherController.js
const Voucher = require('../models/VoucherModel'); // Đảm bảo đường dẫn đúng
const Customer = require('../models/CustomerModel'); // Đảm bảo đường dẫn đúng và CustomerModel tồn tại

const VoucherController = {
    // Hàm hỗ trợ nội bộ để validate và tính toán giảm giá
    // Hàm này sẽ được gọi từ applyVoucher API và OrderController
    _validateAndCalculateDiscountInternal: async (code, currentTotalAmount, customerId) => {
        const voucher = await Voucher.findOne({ code: code.toUpperCase() });

        if (!voucher) {
            return { error: 'Mã voucher không tồn tại.' };
        }

        if (!voucher.isActive) {
            return { error: 'Voucher này không còn hiệu lực.' };
        }

        const now = new Date();
        if (now < voucher.startDate || now > voucher.endDate) {
            return { error: 'Voucher này chưa hoặc đã hết hạn sử dụng.' };
        }

        if (voucher.usedCount >= voucher.usageLimit) {
            return { error: 'Voucher này đã hết lượt sử dụng.' };
        }

        // Kiểm tra xem khách hàng đã sử dụng voucher này chưa
        if (voucher.usersUsed && voucher.usersUsed.includes(customerId)) {
            return { error: 'Bạn đã sử dụng voucher này rồi.' };
        }

        if (currentTotalAmount < voucher.minOrderAmount) {
            return { error: `Đơn hàng phải có giá trị tối thiểu ${voucher.minOrderAmount.toLocaleString()}₫ để áp dụng voucher này.` };
        }

        let discountAmount = 0;
        let discountAppliedDescription = '';

        switch (voucher.discountType) {
            case 'PERCENT':
                discountAmount = currentTotalAmount * (voucher.discountValue / 100);
                if (voucher.maxDiscountAmount !== null && discountAmount > voucher.maxDiscountAmount) {
                    discountAmount = voucher.maxDiscountAmount;
                    discountAppliedDescription = `Giảm ${voucher.discountValue}% (tối đa ${voucher.maxDiscountAmount.toLocaleString()}₫)`;
                } else {
                    discountAppliedDescription = `Giảm ${voucher.discountValue}%`;
                }
                break;
            case 'FIXED_AMOUNT':
                discountAmount = voucher.discountValue;
                discountAppliedDescription = `Giảm trực tiếp ${voucher.discountValue.toLocaleString()}₫`;
                break;
            case 'FREE_SHIPPING':
                discountAmount = 0; // Discount cho freeship được xử lý riêng ở phí vận chuyển
                discountAppliedDescription = 'Miễn phí vận chuyển';
                break;
            default:
                return { error: 'Loại voucher không hợp lệ.' };
        }

        return {
            voucher: voucher,
            discountAmount: discountAmount,
            discountAppliedDescription: discountAppliedDescription,
            isFreeShipping: voucher.discountType === 'FREE_SHIPPING'
        };
    },

    // Hàm hỗ trợ nội bộ để đánh dấu voucher đã sử dụng
    _markVoucherAsUsedInternal: async (voucherId, customerId) => {
        const voucher = await Voucher.findById(voucherId);
        if (voucher) {
            voucher.usedCount += 1;
            // Đảm bảo customerId chưa có trong danh sách trước khi push
            if (customerId && !voucher.usersUsed.map(id => id.toString()).includes(customerId.toString())) {
                voucher.usersUsed.push(customerId);
            }
            await voucher.save();
        }
    },

    applyVoucher: async (req, res) => {
        const { code, totalAmount, customerId } = req.body;

        if (!code || totalAmount === undefined || customerId === undefined) {
            return res.status(400).json({ success: false, message: 'Thiếu mã voucher, tổng tiền hoặc ID khách hàng.' });
        }

        try {
            const result = await VoucherController._validateAndCalculateDiscountInternal(code, totalAmount, customerId);

            if (result.error) {
                return res.status(400).json({ success: false, message: result.error });
            }

            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error applying voucher:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ khi áp dụng voucher.', error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const vouchers = await Voucher.find({});
            res.status(200).json({ success: true, vouchers });
        } catch (error) {
            console.error('Error in findAll vouchers:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách voucher.', error: error.message });
        }
    },

    findVoucherById: async (req, res) => {
        try {
            const voucher = await Voucher.findById(req.params.id);
            if (!voucher) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy voucher.' });
            }
            res.status(200).json({ success: true, voucher });
        } catch (error) {
            console.error('Error in findById voucher:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy voucher.', error: error.message });
        }
    },

    createVoucher: async (req, res) => {
        try {
            const newVoucher = new Voucher(req.body);
            await newVoucher.save();
            res.status(201).json({ success: true, message: 'Voucher đã được tạo thành công.', voucher: newVoucher });
        } catch (error) {
            console.error('Error in create voucher:', error);
            // Bắt lỗi trùng code (unique index)
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: 'Mã voucher đã tồn tại. Vui lòng chọn mã khác.', error: error.message });
            }
            res.status(400).json({ success: false, message: 'Lỗi khi tạo voucher.', error: error.message });
        }
    },

    updateVoucher: async (req, res) => {
        try {
            const updatedVoucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedVoucher) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy voucher để cập nhật.' });
            }
            res.status(200).json({ success: true, message: 'Voucher đã được cập nhật thành công.', voucher: updatedVoucher });
        } catch (error) {
            console.error('Error in update voucher:', error);
            res.status(400).json({ success: false, message: 'Lỗi khi cập nhật voucher.', error: error.message });
        }
    },

    deleteVoucher: async (req, res) => {
        try {
            const deletedVoucher = await Voucher.findByIdAndDelete(req.params.id);
            if (!deletedVoucher) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy voucher để xóa.' });
            }
            res.status(200).json({ success: true, message: 'Voucher đã được xóa thành công.' });
        } catch (error) {
            console.error('Error in delete voucher:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa voucher.', error: error.message });
        }
    },
};

module.exports = VoucherController;