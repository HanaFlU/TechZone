const dotenv = require("dotenv");
dotenv.config();
const User = require('../models/UserModel.js');
const Customer = require('../models/CustomerModel.js');
const Role = require('../models/RoleModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = require('../helpers/generateToken.js');


const AuthController = {
    // Register a new user local
    register: async (req, res) => {
        if (!req.body) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }
        const { name, phone, email, birthdate, gender, password, comfirmpassword } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        if (password !== comfirmpassword) {
            return res.status(400).json({ message: 'Đăng ký thất bại' });
        }

        try {
            const existingUser = await User.findOne({ email });
            const roleDoc = await Role.findOne({ name: 'CUS' });
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                name,
                phone,
                email,
                birthdate,
                password: hashedPassword,
                gender,
                role: roleDoc._id,
                provider: 'local',
            });
            await newUser.save();

            // Create a Customer document for the new user
            await Customer.create({ user: newUser._id });

            const token = generateToken(newUser);

            res.status(201).json({
                message: 'Successful register.',
                token,
            });
        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ message: 'Lỗi server nội bộ' });
        }
    },

    // Login user local
    login: async (req, res) => {
        if (!req.body) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        try {
            const user = await User.findOne({ email }).populate('role');
            if (!user) {
                return res.status(404).json({ message: 'Tài khoản không tồn tại' });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Đăng nhập thất bại' });
            }
            if (!user.isActive) {
                return res.status(403).json({ message: 'Tài khoản chưa kích hoạt' });
            }

            user.lastLogin = new Date();
            await user.save();

            const token = generateToken(user);

            res.status(200).json({
                message: 'Đăng nhập thành công',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role.name,
                }
            });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ message: 'Lỗi server nội bộ' });
        }
    },

    // Google OAuth login
    googleLogin: async (req, res) => {
        const { email, name, providerID } = req.body;
        console.log('Google login request:', req.body);

        try {
            const roleDoc = await Role.findOne({ name: 'CUS' });
            let user = await User.findOne({ email, provider: 'google' }).populate('role');
            // If user does not exist, create a new user with provider 'google'.
            if (!user) {
                user = new User({
                    name,
                    email,
                    provider: 'google',
                    providerID,
                    role: roleDoc._id,
                });
                await user.save();
                await Customer.create({ user: user._id });
            }
            if (!user.isActive) {
                return res.status(403).json({ message: 'Tài khoản chưa kích hoạt' });
            }
            console.log('User found or created:', user);
            user.lastLogin = new Date();
            await user.save();

            const token = generateToken(user);

            res.status(200).json({
                message: 'Login successful.',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role.name,
                }
            });
        } catch (error) {
            console.error('Error during Google login:', error);
            res.status(500).json({ message: 'Lỗi server nội bộ' });
        }
    }

}

module.exports = AuthController;
