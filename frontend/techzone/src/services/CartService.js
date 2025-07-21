import createApiClient from "../utils/api";

class CartService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/carts`) {
        this.api = createApiClient(apiURL);
    }

    /**
     * @param {string} userId
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

    async addToCart(userId, productId, quantity) {
        if (!userId || !productId || typeof quantity !== 'number' || quantity < 1) {
            console.error('CartService Error: userId, productId, and valid quantity are required to add to cart.');
            throw new Error('Missing or invalid parameters for adding to cart.');
        }
        try {
            const response = await this.api.post(`/${userId}`, { productId, quantity });
            return response.data;
        } catch (error) {
            console.error('CartService Error: Failed to add product to cart:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async updateCartItemQuantity(cartId, productId, quantity) {
        if (!cartId || !productId || typeof quantity !== 'number' || quantity < 1) {
            console.error('CartService Error: cartId, productId, and valid quantity are required to update cart item.');
            throw new Error('Missing or invalid parameters for updating cart item.');
        }
        try {
            const response = await this.api.put(`/${cartId}`, { productId, quantity });
            return response.data;
        } catch (error) {
            console.error('CartService Error: Failed to update cart item quantity:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async removeCartItem(cartId, productId) {
        if (!cartId || !productId) {
            console.error('CartService Error: cartId and productId are required to remove cart item.');
            throw new Error('Missing parameters for removing cart item.');
        }
        try {
            const response = await this.api.delete(`/${cartId}/${productId}`);
            return response.data;
        } catch (error) {
            console.error('CartService Error: Failed to remove cart item:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async clearCart(cartId) {
        if (!cartId) {
            console.error('CartService Error: cartId is required to clear cart.');
            throw new Error('Missing cartId for clearing cart.');
        }
        try {
            const response = await this.api.delete(`/clear/${cartId}`);
            return response.data;
        } catch (error) {
            console.error('CartService Error: Failed to clear cart:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

export default new CartService();