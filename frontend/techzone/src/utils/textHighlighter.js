/**
 * Highlights the first occurrence of each category name in a description text
 * @param {string} description - The description text to process
 * @param {Array} categories - Array of category objects with name and slug properties
 * @returns {string} - HTML string with highlighted category names
 */
export const highlightCategoriesInText = (description, categories) => {
  if (!description || !categories || !Array.isArray(categories)) {
    return description;
  }

  let processedText = description;
  const processedCategories = new Set(); // Track processed categories to avoid duplicates

  // Sort categories by name length (longest first) to avoid partial matches
  const sortedCategories = [...categories].sort((a, b) => b.name.length - a.name.length);

  sortedCategories.forEach(category => {
    if (!category.name || !category.slug || processedCategories.has(category.name)) {
      return;
    }

    // Create regex for exact word match (case insensitive)
    const regex = new RegExp(`\\b${escapeRegExp(category.name)}\\b`, 'gi');
    
    // Replace only the first occurrence
    const match = processedText.match(regex);
    if (match) {
      const firstMatch = match[0];
      const link = `<a href="/category/${category.slug}" class="text-blue-600 hover:text-blue-800 underline cursor-pointer">${firstMatch}</a>`;
      
      // Replace only the first occurrence
      processedText = processedText.replace(regex, link);
      processedCategories.add(category.name);
    }
  });

  return processedText;
};

/**
 * Escapes special regex characters in a string
 * @param {string} string - The string to escape
 * @returns {string} - Escaped string
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Strips HTML tags and decodes HTML entities from a string
 * @param {string} html - The HTML string to strip
 * @returns {string} - Plain text without HTML tags
 */
const stripHtmlTags = (html) => {
  if (!html) return '';
  
  // Create a temporary div to decode HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content (this removes all HTML tags)
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Also remove any remaining HTML-like patterns that might have been missed
  text = text.replace(/<[^>]*>/g, '');
  
  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

/**
 * Converts a description with \n\n line breaks to HTML paragraphs
 * @param {string} description - The description text
 * @param {Array} categories - Array of category objects
 * @returns {string} - HTML string with paragraphs and highlighted categories
 */
export const formatDescriptionWithCategories = (description, categories) => {
  if (!description) return '';

  // First strip any existing HTML tags to get clean text
  const cleanDescription = stripHtmlTags(description);
  
  // For now, let's just return the clean text without category highlighting
  // to see if the issue is with the highlighting function
  const paragraphs = cleanDescription.split('\\n\\n');
  
  return paragraphs
    .map(paragraph => `<p class="mb-4">${paragraph}</p>`)
    .join('');
}; 