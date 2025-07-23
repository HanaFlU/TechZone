const express = require("express");
const router = express.Router();
const Category = require("../models/CategoryModel");
const slugify = require("slugify");


// GET all categories
router.get("/", async (req, res) => {
    const categories = await Category.find().populate("parent", "name");
    res.json(categories);
});

// POST create category
router.post("/", async (req, res) => {
    try {
        const { name, description, parent, icon } = req.body;

        const slug = slugify(name, { lower: true, strict: true });

        const newCategory = new Category({ name, slug, description, parent, icon });
        await newCategory.save();
        res.json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update category
router.put("/:id", async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE category
router.delete("/:id", async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
