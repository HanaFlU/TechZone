import axios from 'axios';

const API_URL = 'http://localhost:8000/api/specs';

const SpecService = {
  getAllSpecs: async (categoryId) => {
    const url = categoryId ? `${API_URL}?category=${categoryId}` : API_URL;
    const response = await axios.get(url);
    return response.data;
  }
};

export default SpecService; 