import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    zipcode: {
        type: String,
        required: false,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export default mongoose.model('Address', addressSchema);
