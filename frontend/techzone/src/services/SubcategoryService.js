import axios from 'axios';

const API_URL = 'http://localhost:8000/api/subcategories';

const SubcategoryService = {
  getSubcategoriesByCategory: async (categoryId) => {
    const response = await axios.get(`${API_URL}?category=${categoryId}`);
    return response.data;
  }
};

export default SubcategoryService; 