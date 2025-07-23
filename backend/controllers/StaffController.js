const User = require('../models/UserModel.js');
const Role = require('../models/RoleModel.js');
const bcrypt = require('bcrypt');

const StaffController = {
    findAll: async (req, res) => {
        try {
            const user = await User.find().populate('role');
            const staffs = user.filter(u => u.role && u.role.name !== 'CUS');
            res.status(200).json(staffs);
        } catch (error) {
            console.error('Error fetching customers:', error);
            return res.status(500).json({ message: 'Lỗi khi lấy danh sách khách hàng.' });
        }
    },
    updateStaff: async (req, res) => {
        const { userId } = req.params;
        const { name, email, phone, role, password, isActive } = req.body;
        console.log('Updating staff:', userId, 'with data:', req.body);

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            if (name) user.name = name;
            if (email) user.email = email;
            if (phone) user.phone = phone;
            if (role) {
                console.log('Updating role for user:', userId, 'to role:', role);
                const roleDoc = await Role.findById(role);
                if (!roleDoc) {
                    return res.status(400).json({ message: 'Invalid role.' });
                }
                user.role = roleDoc._id;
            }
            user.isActive = isActive;
            if (password) {
                user.password = await bcrypt.hash(password, 10);
            }
            await user.save();
            res.status(200).json({ message: 'Staff updated successfully.', user });
        } catch (error) {
            console.error('Error updating staff:', error);
            res.status(500).json({ message: 'Failed to update staff.' });
        }
    },
    createStaff: async (req, res) => {
        const { name, email, phone, role, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all required information.' });
        }

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const roleDoc = await Role.findById(role);
            if (!roleDoc) {
                return res.status(400).json({ message: 'Invalid role.' });
            }

            const newUser = new User({
                name,
                email,
                phone,
                password: hashedPassword,
                role: roleDoc._id,
            });

            await newUser.save();
            res.status(201).json({ message: 'Staff created successfully.', user: newUser });
        } catch (error) {
            console.error('Error creating staff:', error);
            res.status(500).json({ message: 'Failed to create staff.' });
        }
    },
};

module.exports = StaffController;
