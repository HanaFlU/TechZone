import createApiClient from "../utils/api";

class CartService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/carts`) {
        this.api = createApiClient(apiURL);
    }
    /**
     * @param {string} userId - ID của người dùng để lấy dữ liệu giỏ hàng.
     * @returns {Promise<object>} Dữ liệu giỏ hàng.
     */

    async getCartData(userId) {
        if (!userId) {
            console.error('CartService Error: userId is required to fetch cart data.');
            throw new Error('User ID is missing.');
        }
        try {
            const response = await this.api.get(`/${userId}`);
            return response.data;
        } catch (error) {
            console.error('CartService Error: Failed to fetch cart:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

}

export default new CartService();