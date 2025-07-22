const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 50,
    },
    permissions: {
        type: [String],
        required: true,
        enum: [
            "CREATE_PRODUCT",
            "READ_PRODUCT",
            "UPDATE_PRODUCT",
            "DELETE_PRODUCT",
            "CREATE_ORDER",
            "READ_ORDER",
            "UPDATE_ORDER",
            "DELETE_ORDER",
            "MANAGE_USERS"
        ],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = mongoose.model('Role', roleSchema);