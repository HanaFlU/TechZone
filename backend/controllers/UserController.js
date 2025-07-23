const Address = require('../models/AddressModel.js');
const Customer = require('../models/CustomerModel.js');
const User = require('../models/UserModel.js');
const Role = require('../models/RoleModel.js');
const bcrypt = require('bcrypt');

const UserController = {
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
            const userId = req.user.id;
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
            const { name, phone, birthdate, gender, isActive } = req.body;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
            }

            user.name = name !== undefined ? name : user.name;
            user.phone = phone !== undefined ? phone : user.phone;
            user.gender = gender !== undefined ? gender : user.gender;
            user.isActive = isActive !== undefined ? isActive : user.isActive;

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
                isActive: updatedUser.isActive,
            };

            res.status(200).json({ success: true, message: 'Hồ sơ đã cập nhật thành công!', user: updatedAccountInfo });

        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin tài khoản:', error);
            res.status(500).json({ success: false, message: 'Lỗi server.' });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
            }

            // Xóa địa chỉ liên kết
            await Address.deleteMany({ user: userId });
            // Xóa khách hàng liên kết
            await Customer.deleteOne({ user: userId });
            // Xóa người dùng
            await User.findByIdAndDelete(userId);

            res.status(200).json({ success: true, message: 'Người dùng đã được xóa thành công.' });
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            res.status(500).json({ success: false, message: 'Lỗi server.' });
        }
    },
};

module.exports = UserController;
