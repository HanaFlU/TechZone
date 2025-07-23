const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const { connect } = require("./config/db.config.js");

const RoleRoute = require("./routes/RoleRoute.js");
const UserRoute = require("./routes/UserRoute.js");
const CustomerRoute = require("./routes/CustomerRoute.js");
const StaffRoute = require("./routes/StaffRoute.js");
const OrderRoute = require("./routes/OrderRoute.js");
const CartRoute = require("./routes/CartRoute.js");
const AuthRoute = require("./routes/AuthRoute.js");
const PaymentRoute = require("./routes/PaymentRoute.js");
const shippingRateRoute = require("./routes/ShippingRateRoute.js");
const productRoutes = require('./routes/ProductRoute');
const CategoryRoute = require('./routes/CategoryRoute.js');
const BrandRoute = require("./routes/BrandRoute.js");
const SaleEventRoute = require("./routes/SaleEventRoute.js");
const SubcategoryRoute = require("./routes/SubcategoryRoute.js");
const UploadRoute = require("./routes/UploadRoute.js");
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
app.use('/api/upload', UploadRoute);
app.use('/api/roles', protect, checkPermission(["AD"], "MANAGE_ROLES"), RoleRoute);
app.use('/api/users', protect, UserRoute);
app.use('/api/customers', protect, CustomerRoute);
app.use('/api/staffs', protect, StaffRoute);
app.use('/api/orders', protect, OrderRoute);
app.use('/api/carts', protect, CartRoute);
app.use('/api/payments', protect, PaymentRoute);
app.use('/api/shipping-rate', protect, shippingRateRoute);
app.use('/api/products', productRoutes);
app.use('/api/categories', CategoryRoute);
app.use('/api/brands', BrandRoute);
app.use('/api/sale-events', SaleEventRoute);
app.use('/api/subcategories', SubcategoryRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Route not found
app.use((req, res, next) => {
    res.status(404).json({ message: "Route không tồn tại." });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Lỗi server nội bộ." });
});