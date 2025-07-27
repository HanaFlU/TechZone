const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    discountType: {
        type: String,
        enum: ['PERCENT', 'FIXED_AMOUNT'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    maxDiscountAmount: {
        type: Number,
        min: 0,
        default: null
    },
    minOrderAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    usersUsed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }]
}, {
    timestamps: true
});

VoucherSchema.pre('save', function (next) {
    if (this.endDate && this.endDate < new Date()) {
        this.isActive = false;
    }
    next();
});

module.exports = mongoose.model('Voucher', VoucherSchema);