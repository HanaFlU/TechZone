import axios from 'axios';

const API_URL = 'http://localhost:8000/api/categories';

const CategoryService = {
  getAllCategories: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  }
};

export default CategoryService; 