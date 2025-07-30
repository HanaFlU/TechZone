import createApiClient from "../utils/api";

class ReviewService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/reviews`) {
        this.api = createApiClient(apiURL);
    }

    async createReview(productId, rating, comment) {
        try {
            console.log('ReviewService: Creating review for product:', productId, 'rating:', rating);
            const response = await this.api.post('/', { productId, rating, comment });
            return response.data;
        } catch (error) {
            console.error('ReviewService Error: Failed to create review:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
    async getReviewsByProductId(productId) {
        try {
            console.log('ReviewService: Fetching reviews for product ID:', productId);
            const response = await this.api.get(`/${productId}`);
            return response.data;
        } catch (error) {
            console.error('ReviewService Error: Failed to fetch reviews by product ID:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getMyReviewForProduct(productId) {
        try {
            console.log('ReviewService: Fetching my review for product ID:', productId);
            const response = await this.api.get(`/${productId}/my-review`);
            return response.data;
        } catch (error) {

            if (error.response && error.response.status === 404) {
                console.log(`ReviewService: No review found for product ${productId} by current user.`);
                return null;
            }
            console.error('ReviewService Error: Failed to fetch my review for product ID:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getProductsWithHighRatings(minRating = 4, limit = 10) {
        try {
            const response = await this.api.get(`/featured/high-rated?minRating=${minRating}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('ReviewService Error: Failed to fetch products with high ratings:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

}

export default new ReviewService();