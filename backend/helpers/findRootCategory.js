const mongoose = require("mongoose");
const TestCategory = require("../models/CategoryModel");

async function findRootCategory(categoryId) {
    const category = await TestCategory.findById(categoryId).lean();

    if (!category) return null;
    if (!category.parent) return category;

    return await findRootCategory(category.parent);
}

module.exports = findRootCategory;