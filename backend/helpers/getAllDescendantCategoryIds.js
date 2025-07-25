const mongoose = require("mongoose");
const TestCategory = require("../models/CategoryModel");

async function getAllDescendantCategoryIds(parentId) {
    const result = [];
    const queue = [parentId];

    while (queue.length > 0) {
        const currentId = queue.shift();
        result.push(currentId);

        const children = await TestCategory.find({ parent: currentId }).select("_id").lean();
        for (const child of children) {
            queue.push(child._id);
        }
    }

    return result;
}
module.exports = getAllDescendantCategoryIds;