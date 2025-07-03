const Address = require('../models/AddressModel.js');
const Customer = require('../models/CustomerModel.js');
const User = require('../models/UserModel.js');
const CustomerController = {
    findAll: async (req, res) => {
        Customer.find()
            .then((data) => res.status(200).json(data))
            .catch((err) => res.status(500).json(err.message));
    },

    getAccountInfo: async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng.'
                });
            }

            const accountInfo = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                birthdate: user.birthdate,
                gender: user.gender,
            };

            res.status(200).json({
                success: true,
                user: accountInfo,
            });

        } catch (error) {
            console.error('Lỗi khi lấy thông tin tài khoản:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server.'
            });
        }
    },
    updateAccountInfo: async (req, res) => {
        try {
            const userId = req.params.userId;
            const { name, phone, birthdate, gender } = req.body;

            console.log('Dữ liệu nhận từ frontend (updateAccountInfo):', req.body);

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
            }

            user.name = name !== undefined ? name : user.name;
            user.phone = phone !== undefined ? phone : user.phone;
            user.gender = gender !== undefined ? gender : user.gender;

            if (birthdate !== undefined) {
                if (birthdate) {
                    user.birthdate = new Date(birthdate);
                } else {
                    user.birthdate = null;
                }
            }
            const updatedUser = await user.save();
            const updatedAccountInfo = {
                _id: updatedUser._id,
                name: updatedUser.name,
                phone: updatedUser.phone,
                email: updatedUser.email,
                birthdate: updatedUser.birthdate,
                gender: updatedUser.gender,
            };

            res.status(200).json({ success: true, message: 'Hồ sơ đã cập nhật thành công!', user: updatedAccountInfo });

        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin tài khoản:', error);
            res.status(500).json({ success: false, message: 'Lỗi server.' });
        }
    },

    getAddresses: async (req, res) => {
        const { customerId } = req.params;
        try {
            const customer = await Customer.findById(customerId)
                .populate('shippingAddresses');

            if (!customer) {
                return res.status(404).json({ message: 'Customer not found.' });
            }

            res.status(200).json({ customer });
        } catch (error) {
            console.error('Error fetching customer profile with addresses:', error);
            res.status(500).json({ message: 'Server error while fetching customer profile.', error: error.message });
        }
    },
    addAddress: async (req, res) => {
        const { customerId } = req.params;
        const { fullName, phone, street, city, district, zipcode, isDefault } = req.body;

        try {
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found.' });
            }

            const newAddress = new Address({
                customer: customerId,
                fullName, phone, street, city, district, zipcode, isDefault
            });
            const savedAddress = await newAddress.save();

            customer.shippingAddresses.push(savedAddress._id);
            await customer.save();

            res.status(201).json({ message: 'Address added successfully!', address: savedAddress });

        } catch (error) {
            console.error('Error adding address to customer:', error);
            res.status(500).json({ message: 'Server error adding address.', error: error.message });
        }
    },
};

module.exports = CustomerController;
