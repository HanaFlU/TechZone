const Category = require('../models/CategoryModel');

/**
 * Recursively finds all descendant category IDs for a given parent category
 * @param {string} parentId - The parent category ID
 * @returns {Promise<string[]>} Array of all descendant category IDs including the parent
 */
const getAllDescendantCategoryIds = async (parentId) => {
  try {
    const descendants = [];
    const queue = [parentId];
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      descendants.push(currentId);
      
      // Find all direct children of the current category
      const children = await Category.find({ parent: currentId }).select('_id');
      
      // Add children to the queue for further processing
      children.forEach(child => {
        queue.push(child._id.toString());
      });
    }
    
    return descendants;
  } catch (error) {
    console.error('Error getting descendant category IDs:', error);
    throw error;
  }
};

/**
 * Gets all leaf category IDs (categories with no children) for a given parent
 * @param {string} parentId - The parent category ID
 * @returns {Promise<string[]>} Array of leaf category IDs
 */
const getLeafCategoryIds = async (parentId) => {
  try {
    const allDescendants = await getAllDescendantCategoryIds(parentId);
    const leafCategories = [];
    
    for (const categoryId of allDescendants) {
      // Check if this category has any children
      const hasChildren = await Category.exists({ parent: categoryId });
      
      if (!hasChildren) {
        leafCategories.push(categoryId);
      }
    }
    
    return leafCategories;
  } catch (error) {
    console.error('Error getting leaf category IDs:', error);
    throw error;
  }
};

module.exports = { getAllDescendantCategoryIds, getLeafCategoryIds };