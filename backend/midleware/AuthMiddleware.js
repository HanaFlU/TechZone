const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();
const User = require('../models/UserModel');
const Role = require('../models/RoleModel');

const protect = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        const token = req.headers.authorization.split(" ")[1];
        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }

    };
    // If no token is provided
    return res.status(401).json({ message: "Not authorized, no token provided" });

};

const checkPermission = (roles = [], permission = "") => {
    return async (req, res, next) => {
        // If path is get products, don't need to check permission
        const path = req.path;
        if (path === '/api/products') {
            return next();
        }

        const userId = req.user.id;
        const user = await User.findById(userId).populate('role');
        if (!user || !user.role) {
            return res.status(403).json({ message: "Bạn chưa đăng nhập hoặc không có role!" });
        }
        // Check role
        if (roles.length > 0 && !roles.includes(user.role.name)) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập (role)!" });
        }
        // Check permission
        if (permission && (!user.role.permissions || !user.role.permissions.includes(permission))) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập (permission)!" });
        }
        next();
    };
};


module.exports = { protect, checkPermission };