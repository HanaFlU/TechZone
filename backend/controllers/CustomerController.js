import Address from '../models/AddressModel.js';
import Customer from '../models/CustomerModel.js';
import User from '../models/UserModel.js';

const CustomerController = {
    findAll: async (req, res) => {
        Customer.find()
            .then((data) => res.status(200).json(data))
            .catch((err) => res.status(500).json(err.message));
    },

    getAccountInfo: async (req, res) => {
        try {
            const customerId = req.params.customerId;
            const customer = await Customer.findById(customerId).populate('user');

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy customer.'
                });
            }

            if (!customer.user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin user.'
                });
            }

            const accountInfo = {
                _id: customer.user._id,
                name: customer.user.name,
                email: customer.user.email,
                phone: customer.user.phone,
                birthdate: customer.user.birthdate,
                gender: customer.user.gender,
            };

            res.status(200).json({
                success: true,
                user: accountInfo,
                customerId: customer._id,
            });

        } catch (error) {
            console.error('Lỗi khi lấy thông tin tài khoản theo Customer ID:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server.'
            });
        }
    },

    updateAccountInfo: async (req, res) => {
        try {
            const customerId = req.params.customerId;
            const { name, phone, birthdate, gender } = req.body;

            // Tìm Customer
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy customer.' });
            }
            // Tìm User
            const user = await User.findById(customer.user);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy user.' });
            }

            user.name = name || user.name;
            user.phone = phone || user.phone;
            user.birthdate = birthdate || user.birthdate;
            user.gender = gender || user.gender;

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

export default CustomerController;
