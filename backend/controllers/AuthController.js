const User = require('../models/UserModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateToken = require('../helpers/generateToken.js');

const dotenv = require("dotenv");
dotenv.config();

const AuthController = {
    // Register a new user local
    register: async (req, res) => {
        if (!req.body) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
        }
        const { name, phone, email, birthdate, gender, password, comfirmpassword } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
        }

        if (password !== comfirmpassword) {
            return res.status(400).json({ message: 'Mật khẩu không khớp.' });
        }

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã được sử dụng.' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                name,
                phone,
                email,
                birthdate,
                password: hashedPassword,
                gender,
                role: 'CUS',
                provider: 'local',
            });
            await newUser.save();

            const token = generateToken(newUser);

            res.status(201).json({
                message: 'Đăng ký thành công.',
                user: {
                    ...newUser.toObject(),
                    _id: newUser._id
                },
                token,
            });
        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ message: 'Đăng ký thất bại. Vui lòng thử lại.' });
        }
    },

    // Login user local
    login: async (req, res) => {
        if (!req.body) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
        }
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
        }

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại.' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Mật khẩu không đúng.' });
            }

            user.lastLogin = new Date();
            await user.save();

            const token = generateToken(user);

            res.status(200).json({
                message: 'Đăng nhập thành công.',
                user,
                token,
            });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ message: 'Đăng nhập thất bại. Vui lòng thử lại.' });
        }
    },

    // Google OAuth login
    googleLogin: async (req, res) => {
        const { email, name, providerID } = req.body;
        console.log('Google login request:', req.body);

        try {
            let user = await User.findOne({ email, provider: 'google' });
            if (!user) {
                user = new User({
                    name,
                    email,
                    provider: 'google',
                    providerID,
                    role: 'CUS',
                });
                await user.save();
            }

            user.lastLogin = new Date();
            await user.save();

            const token = generateToken(user);

            res.status(200).json({
                message: 'Đăng nhập thành công.',
                user,
                token,
            });
        } catch (error) {
            console.error('Error during Google login:', error);
            res.status(500).json({ message: 'Đăng nhập thất bại. Vui lòng thử lại.' });
        }
    }

}

module.exports = AuthController;