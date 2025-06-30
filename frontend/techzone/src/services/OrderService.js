// src/services/OrderService.js
import createApiClient from "../utils/api";

class OrderService {
    constructor(baseURL = "http://localhost:8000/api/orders") { // Đảm bảo đúng baseURL của Order API
        this.api = createApiClient(baseURL);
    }

    /**
     * Gửi yêu cầu tạo một đơn hàng mới từ giỏ hàng.
     * Tương ứng với POST /api/orders/create-from-cart
     * @param {object} orderData - Dữ liệu cần thiết để tạo đơn hàng (customerId, shippingAddressId, paymentMethod).
     * @returns {Promise<object>} Dữ liệu của đơn hàng đã được tạo.
     */
    async createOrder(orderData) {
        try {
            console.log('OrderService: Attempting to POST to URL:', `${this.api.defaults.baseURL}`, 'with data:', orderData);
            const response = await this.api.post('/', orderData);
            return response.data;
        } catch (error) {
            console.error('OrderService Error: Failed to create order:', error.response ? error.response.data : error.message);
            if (error.response && error.response.data) {
                console.error('OrderService Error: Backend response data:', error.response.data);
            }
            throw error;
        }
    }
}

export default new OrderService();