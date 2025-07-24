import createApiClient from "../utils/api";


class PeoductService {
  constructor(apiURL = `${import.meta.env.VITE_API_URL}/products`) {
    this.api = createApiClient(apiURL);
  }
  async getAllProducts() {
    try {
      const response = await this.api.get("/");
      return response.data.data;
    } catch (error) {
      console.error('ProductService Error: Failed to fetch products:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
  async createProduct(productData) {
    try {
      const response = await this.api.post("/", productData);
      return response.data;
    } catch (error) {
      console.error('ProductService Error: Failed to create product:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
  async updateProduct(productId, productData) {
    try {
      const response = await this.api.put(`/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('ProductService Error: Failed to update product:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
  async deleteProduct(productId) {
    try {
      const response = await this.api.delete(`/${productId}`);
      return response.data;
    } catch (error) {
      console.error('ProductService Error: Failed to delete product:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

};

export default new PeoductService();