import createApiClient from "../utils/api";

class CartService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/cart`) {
        this.api = createApiClient(apiURL);
        this.fixedUserId = '6856b6f4cf118b51cb681313';
    }
    /**
     * @param {string} userId - ID của người dùng để lấy dữ liệu giỏ hàng.
     * @returns {Promise<object>} Dữ liệu giỏ hàng.
     */
    async getCartDataForLocalStorage() {
        // Thêm userId vào hàm trên khi không gán cứng userID nữa
        // if (!userId) {
        //     console.error('CartService Error: userId is required to fetch cart data.');
        //     throw new Error('User ID is missing.');
        // }
        try {
            const response = await this.api.get(`/${this.fixedUserId}`);
            return response.data;
        } catch (error) {
            console.error('CartService Error: Failed to fetch cart:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

}

export default new CartService();