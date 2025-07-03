const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        birthdate: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: ['MALE', 'FEMALE', 'OTHER'],
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['CUS', 'AD'],
            default: 'CUS',
        },
        provider: { //for google login
            type: String,
        },
        providerID: { //is provided by google OAuth
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model('User', userSchema);