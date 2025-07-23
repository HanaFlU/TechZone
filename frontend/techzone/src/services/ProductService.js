import axios from 'axios';

const API_URL = 'http://localhost:8000/api/products';

const ProductService = {
  getAllProducts: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  }
};

export default ProductService;