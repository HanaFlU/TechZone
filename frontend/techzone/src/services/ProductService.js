import createApiClient from "../utils/api";

class ProductService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/products`) {
        this.api = createApiClient(apiURL);
    }

    async getAllProducts() {
        try {
            const response = await this.api.get("/");
            return response.data;
        } catch (error) {
            console.error('ProductService Error: Failed to fetch products:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

export default new ProductService();