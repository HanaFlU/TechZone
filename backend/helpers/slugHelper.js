const slugify = require('slugify');
const Category = require('../models/CategoryModel');

const generateSlug = (name) => slugify(name, { lower: true });

const ensureSlug = (data) => {
    if (!data.slug && data.name) {
        data.slug = generateSlug(data.name);
    }
    return data;
};

const isDuplicateSlug = async (slug, excludeId = null) => {
    const condition = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };
    const existing = await Category.findOne(condition);
    return !!existing;
};

// Remove diacritics and normalize string (lowercase, trim)
const removeDiacritics = (str) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[\u0300-\u036f]/g, '');
};

module.exports = { generateSlug, ensureSlug, isDuplicateSlug, removeDiacritics };