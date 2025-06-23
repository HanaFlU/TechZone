require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connect } = require("./config/db.config");

const app = express();
const OrderRoute = require("./routes/OrderRoute");

app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "PUT", "POST", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
)

app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "Welcom to Techzone application." });
});
app.use('/api/orders', OrderRoute);

connect();

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