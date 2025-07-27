import createApiClient from "../utils/api";

class ProductService {
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
  async getProductById(productId) {
    try {
      const response = await this.api.get(`/${productId}`);
      return response.data.data;
    } catch (error) {
      console.error('ProductService Error: Failed to fetch product:', error.response ? error.response.data : error.message);
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

  async getTopSellingProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      console.log('ProductService: Attempting to GET top selling products with filters:', queryParams);
      const response = await this.api.get(`/reports/top-selling?${queryParams}`);
      return response.data; // Server trả về { success, data: topProducts }
    } catch (error) {
      console.error('ProductService Error: Failed to get top selling products:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

export default new ProductService();
