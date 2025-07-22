const Address = require('../models/AddressModel.js');
const Customer = require('../models/CustomerModel.js');
const User = require('../models/UserModel.js');
const CustomerController = {
    findAll: async (req, res) => {
        try {
            const customers = await Customer.find().populate('user');
            res.status(200).json(customers);
        } catch (error) {
            console.error('Error fetching customers:', error);
            return res.status(500).json({ message: 'Lỗi khi lấy danh sách khách hàng.' });
        }
    },

    getUserInfo: async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin khách hàng.'
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
    updateUserInfo: async (req, res) => {
        try {
            const userId = req.params.userId;
            const { name, phone, birthdate, gender } = req.body;
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
    getCustomerByUserId: async (req, res) => {
        try {
            const userId = req.user.id;
            const customer = await Customer.findOne({ user: userId });

            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found for this user.' });
            }

            res.status(200).json({ success: true, customer });
        } catch (error) {
            console.error('Error fetching customer by user ID:', error);
            res.status(500).json({ success: false, message: 'Server error while fetching customer by user ID.', error: error.message });
        }
    },

    getAddresses: async (req, res) => {
        const { customerId } = req.user.id;
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

    getAddressById: async (req, res) => {
        const { addressId } = req.params;
        try {
            const address = await Address.findById(addressId);
            if (!address) {
                return res.status(404).json({ success: false, message: 'Address not found.' });
            }
            res.status(200).json({ success: true, address });
        } catch (error) {
            console.error('Error fetching address by ID:', error);
            res.status(500).json({ success: false, message: 'Server error fetching address.', error: error.message });
        }
    },

    addAddress: async (req, res) => {
        const { customerId } = req.params;
        const { fullName, phone, street, city, district, ward, zipcode, isDefault } = req.body;

        try {
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found.' });
            }
            if (isDefault) {
                await Address.updateMany(
                    { customer: customerId, isDefault: true },
                    { $set: { isDefault: false } }
                );
            }

            const newAddress = new Address({
                customer: customerId,
                fullName, phone, street, city, district, ward, zipcode, isDefault
            });
            const existingAddressesCount = await Address.countDocuments({ customer: customerId });
            if (existingAddressesCount === 0) {
                newAddress.isDefault = true;
            }

            const savedAddress = await newAddress.save();
            customer.shippingAddresses.push(newAddress._id);
            await customer.save();
            res.status(201).json({ success: true, message: 'Address added successfully!', address: savedAddress });

        } catch (error) {
            console.error('Error adding address to customer:', error);
            res.status(500).json({ success: false, message: 'Server error adding address.', error: error.message });
        }
    },
    updateAddress: async (req, res) => {
        const { addressId } = req.params;
        const { fullName, phone, street, city, district, ward, zipcode, isDefault } = req.body;

        try {
            const address = await Address.findById(addressId);
            if (!address) {
                return res.status(404).json({ success: false, message: 'Address not found.' });
            }

            if (isDefault === true) {
                await Address.updateMany(
                    { customer: address.customer, isDefault: true, _id: { $ne: addressId } },
                    { $set: { isDefault: false } }
                );
            }

            address.fullName = fullName !== undefined ? fullName : address.fullName;
            address.phone = phone !== undefined ? phone : address.phone;
            address.street = street !== undefined ? street : address.street;
            address.city = city !== undefined ? city : address.city;
            address.district = district !== undefined ? district : address.district;
            address.ward = ward !== undefined ? ward : address.ward;
            address.zipcode = zipcode !== undefined ? zipcode : address.zipcode;
            address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

            const updatedAddress = await address.save();
            res.status(200).json({ success: true, message: 'Address updated successfully!', address: updatedAddress });

        } catch (error) {
            console.error('Error updating address:', error);
            res.status(500).json({ success: false, message: 'Server error updating address.', error: error.message });
        }
    },
    deleteAddress: async (req, res) => {
        const { customerId, addressId } = req.params;
        try {
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found.' });
            }
            // Delete in customers
            customer.shippingAddresses = customer.shippingAddresses.filter(
                (addrId) => addrId.toString() !== addressId
            );
            await customer.save();
            await Address.findByIdAndDelete(addressId);
            res.status(200).json({ success: true, message: 'Address deleted successfully!' });
        } catch (error) {
            console.error('Error deleting address:', error);
            res.status(500).json({ success: false, message: 'Server error deleting address.', error: error.message });
        }
    },
    deleteCustomer: async (req, res) => {
        try {
            const { customerId } = req.params;
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found.' });
            }
            // Xóa user liên kết
            await User.findByIdAndDelete(customer.user);
            // Xóa customer
            await Customer.findByIdAndDelete(customerId);
            res.status(200).json({ message: 'Customer deleted successfully.' });
        } catch (error) {
            console.error('Error deleting customer:', error);
            res.status(500).json({ message: 'Server error while deleting customer.', error: error.message });
        }
    },
};

module.exports = CustomerController;
