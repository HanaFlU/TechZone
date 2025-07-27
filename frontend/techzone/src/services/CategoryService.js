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

    async getProductsByCategory(identifier, options = {}) {
        try {
            const { 
                page = 1, 
                limit = 20, 
                sort = 'name', 
                order = 'asc',
                priceRange,
                brands,
                minRating,
                availability
            } = options;
            
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort,
                order
            });

            // Add price range filter
            if (priceRange) {
                if (priceRange.min !== undefined) {
                    queryParams.append('minPrice', priceRange.min.toString());
                }
                if (priceRange.max !== undefined && priceRange.max !== null) {
                    queryParams.append('maxPrice', priceRange.max.toString());
                }
            }

            // Add brand filter
            if (brands && brands.length > 0) {
                brands.forEach(brand => {
                    queryParams.append('brands', brand);
                });
            }

            // Add rating filter
            if (minRating) {
                queryParams.append('minRating', minRating.toString());
            }

            // Add availability filter
            if (availability) {
                queryParams.append('availability', availability);
            }
            
            const response = await this.api.get(`/${identifier}/products?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('CategoryService Error: Failed to get products by category:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
};

export default new CategoryService();