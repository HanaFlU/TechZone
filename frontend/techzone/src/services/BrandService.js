import axios from 'axios';

const API_URL = 'http://localhost:8000/api/brands';

const BrandService = {
  getAllBrands: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  }
};

export default BrandService; 