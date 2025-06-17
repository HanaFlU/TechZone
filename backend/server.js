require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connect } = require("./config/db.config");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "PUT", "POST", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
)

app.use(express.json());

connect();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is runing on port ${PORT}`));

