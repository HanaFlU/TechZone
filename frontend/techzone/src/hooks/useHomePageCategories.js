import { useState, useEffect } from 'react';
import CategoryService from '../services/CategoryService';

export const useHomePageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subcategoriesByParent, setSubcategoriesByParent] = useState({});

  useEffect(() => {
    CategoryService.getCategories()
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    // Separate main categories and subcategories from merged data
    const mainCats = categories.filter(cat => !cat.parent);
    const subcats = categories.filter(cat => cat.parent);

    // Group subcategories by parent _id
    const subcatsByParent = {};
    subcats.forEach(subcat => {
      const parentId = typeof subcat.parent === 'object' ? subcat.parent.$oid || subcat.parent : subcat.parent || subcat.parent;
      if (!subcatsByParent[parentId]) {
        subcatsByParent[parentId] = [];
      }
      subcatsByParent[parentId].push(subcat);
    });

    setMainCategories(mainCats);
    setSubcategoriesByParent(subcatsByParent);
  }, [categories]);

  return {
    categories,
    mainCategories,
    subcategoriesByParent
  };
}; 