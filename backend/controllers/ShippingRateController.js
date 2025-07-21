const ShippingRate = require('../models/ShippingRateModel');

exports.getAll = async (req, res) => {
    try {
        const rates = await ShippingRate.find();
        res.json({ shippingRates: rates });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy bảng phí ship.' });
    }
};

exports.getFee = async (req, res) => {
    try {
        const { orderValue } = req.query;
        if (!orderValue) return res.status(400).json({ message: 'Thiếu orderValue' });
        const value = Number(orderValue);
        const rate = await ShippingRate.findOne({
            minOrderValue: { $lte: value },
            $or: [
                { maxOrderValue: { $gte: value } },
                { maxOrderValue: null }
            ]
        });
        res.json({ shippingFee: rate ? rate.shippingFee : 20000 });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi tính phí ship.' });
    }
};
