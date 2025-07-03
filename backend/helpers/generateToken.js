const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const generateToken = (newUser) => {
    return jwt.sign(
        {
            id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            provider: newUser.provider || 'local',
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d',
        }
    );
};

module.exports = generateToken;