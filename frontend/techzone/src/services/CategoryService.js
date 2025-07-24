import createApiClient from "../utils/api";


class CategoryService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/categories`) {
        this.api = createApiClient(apiURL);
    }

    async getCategories() {
        try {
            const response = await this.api.get("/");
            return response.data;
        } catch (error) {
            console.error('CategoryService Error: Failed to fetch categories:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
    async createCategory(categoryData) {
        try {
            const response = await this.api.post("/", categoryData);
            return response.data;
        } catch (error) {
            console.error('CategoryService Error: Failed to create category:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
    async updateCategory(id, categoryData) {
        try {
            const response = await this.api.put(`/${id}`, categoryData);
            return response.data;
        } catch (error) {
            console.error('CategoryService Error: Failed to update category:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
    async deleteCategory(id) {
        try {
            const response = await this.api.delete(`/${id}`);
            return response.data;
        } catch (error) {
            console.error('CategoryService Error: Failed to delete category:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
};

export default new CategoryService();