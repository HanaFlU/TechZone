const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary.config');

const router = express.Router();
const upload = multer({ storage });

// Upload SVG icon
router.post("/icon", upload.single("icon"), async (req, res) => {
    try {
        console.log("Req.file:", req.file);
        if (!req.file || !req.file.path) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        res.json({ url: req.file.path });
    } catch (err) {
        console.error("Upload failed:", err);
        res.status(500).json({ error: "Upload failed" });
    }
});

// Upload image
router.post("/image", upload.single("image"), async (req, res) => {
    try {
        console.log("Req.file:", req.file);
        if (!req.file || !req.file.path) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        res.json({ url: req.file.path });
    } catch (err) {
        console.error("Upload failed:", err);
        res.status(500).json({ error: "Upload failed" });
    }
});

module.exports = router;
