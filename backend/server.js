const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const OpenAI = require('openai');
const { connect } = require("./config/db.config.js");

const RoleRoute = require("./routes/RoleRoute.js");
const UserRoute = require("./routes/UserRoute.js");
const CustomerRoute = require("./routes/CustomerRoute.js");
const StaffRoute = require("./routes/StaffRoute.js");
const OrderRoute = require("./routes/OrderRoute.js");
const CartRoute = require("./routes/CartRoute.js");
const AuthRoute = require("./routes/AuthRoute.js");
const PaymentRoute = require("./routes/PaymentRoute.js");
const ShippingRateRoute = require("./routes/ShippingRateRoute.js");
const productRoutes = require('./routes/ProductRoute');
const CategoryRoute = require('./routes/CategoryRoute.js');
const VoucherRoute = require("./routes/VoucherRoute.js");
const ReviewRoute = require("./routes/ReviewRoute.js");

const SaleEventRoute = require("./routes/SaleEventRoute.js");

const UploadRoute = require("./routes/UploadRoute.js");
connect();
const { protect, checkPermission } = require("./midleware/AuthMiddleware.js");
const app = express();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
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
app.use('/api/shipping-rate', protect, ShippingRateRoute);
app.use('/api/vouchers', protect, VoucherRoute);
app.use('/api/products', productRoutes);
app.use('/api/categories', CategoryRoute);

app.use('/api/sale-events', SaleEventRoute);
app.use('/api/reviews', ReviewRoute);
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Dữ liệu tin nhắn không hợp lệ.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            temperature: 0.7,
            max_tokens: 500,
        });

        res.json({ reply: completion.choices[0].message.content });

    } catch (error) {
        console.error('Lỗi khi gọi OpenAI API:', error);
        // Kiểm tra lỗi cụ thể từ OpenAI
        if (error.response) {
            console.error(error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ hoặc lỗi từ OpenAI API.', details: error.message });
        }
    }
});

const PORT = process.env.PORT || 8000;
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