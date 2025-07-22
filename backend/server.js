const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const { connect } = require("./config/db.config.js");

const RoleRoute = require("./routes/RoleRoute.js");
const CustomerRoute = require("./routes/CustomerRoute.js");
const OrderRoute = require("./routes/OrderRoute.js");
const CartRoute = require("./routes/CartRoute.js");
const AuthRoute = require("./routes/AuthRoute.js");
const PaymentRoute = require("./routes/PaymentRoute.js");
const shippingRateRoute = require("./routes/ShippingRateRoute.js");
connect();
const { protect, checkPermission } = require("./midleware/AuthMiddleware.js");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "PUT", "POST", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcom to Techzone application." });
});

app.use('/api/auth', AuthRoute);
app.use('/api/roles', protect, checkPermission(["AD"], "MANAGE_ROLES"), RoleRoute);
app.use('/api/customers', protect, CustomerRoute);
app.use('/api/orders', OrderRoute);
app.use('/api/carts', CartRoute);
app.use('/api/payments', PaymentRoute);
app.use('/api/shipping-rate', shippingRateRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Route not found
app.use((req, res, next) => {
    res.status(404).json({ message: "Route không tồn tại." });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Lỗi server nội bộ." });
});