import { useState, useEffect } from 'react';
import ProductService from '../services/ProductService';
import ReviewService from '../services/ReviewService';
import CategoryService from '../services/CategoryService';

export const useHomePageProducts = (categories) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  
  // State for category-specific products
  const [cpuProducts, setCpuProducts] = useState([]);
  const [monitorProducts, setMonitorProducts] = useState([]);
  const [accessoriesProducts, setAccessoriesProducts] = useState([]);

  // Helper function to get all products from a parent category including subcategories
  const getProductsByParentCategory = async (parentCategoryName) => {
    try {
      // Find the parent category by name
      const parentCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(parentCategoryName.toLowerCase()) && !cat.parent
      );
      
      if (!parentCategory) {
        console.warn(`Parent category "${parentCategoryName}" not found`);
        return [];
      }

      // Get all descendant category IDs
      const descendantIds = await CategoryService.getDescendantCategoryIds(parentCategory._id);
      
      // Ensure descendantIds is an array
      if (!Array.isArray(descendantIds)) {
        console.error(`Expected array for descendantIds, got:`, descendantIds);
        return [];
      }
      
      // Filter products that belong to any of the descendant categories
      return products.filter(product => {
        if (!product.category) return false;
        const catId = typeof product.category === 'object' ? product.category._id : product.category;
        return descendantIds.includes(catId);
      });
    } catch (error) {
      console.error(`Error getting products for ${parentCategoryName}:`, error);
      return [];
    }
  };

  useEffect(() => {
    ProductService.getAllProducts()
      .then(data => setProducts(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    ReviewService.getProductsWithHighRatings(4, 4)
      .then(data => setFeaturedProducts(data))
      .catch(err => {
        console.error('Failed to fetch featured products:', err);
        // Fallback to regular products if featured products fetch fails
        setFeaturedProducts([]);
      })
      .finally(() => setFeaturedLoading(false));
  }, []);

  // Fetch category-specific products when categories and products are loaded
  useEffect(() => {
    if (categories.length > 0 && products.length > 0) {
      // Fetch CPU products
      getProductsByParentCategory('CPU')
        .then(cpuProds => setCpuProducts(cpuProds))
        .catch(err => console.error('Error fetching CPU products:', err));

      // Fetch Monitor products
      getProductsByParentCategory('Màn hình')
        .then(monitorProds => setMonitorProducts(monitorProds))
        .catch(err => console.error('Error fetching Monitor products:', err));

      // Fetch Accessories products
      getProductsByParentCategory('Phụ kiện')
        .then(accessoriesProds => setAccessoriesProducts(accessoriesProds))
        .catch(err => console.error('Error fetching Accessories products:', err));
    }
  }, [categories, products]);

  return {
    products,
    featuredProducts,
    loading,
    featuredLoading,
    cpuProducts,
    monitorProducts,
    accessoriesProducts
  };
}; 