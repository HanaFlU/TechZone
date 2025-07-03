const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

export const protect = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        const token = req.headers.authorization.split(" ")[1];
        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Attach user information to the request object
            req.user = decoded;
            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }

    };
    // If no token is provided
    return res.status(401).json({ message: "Not authorized, no token provided" });

};
