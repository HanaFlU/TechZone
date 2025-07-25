import createApiClient from "../utils/api";

class OrderService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/orders`) {
        this.api = createApiClient(apiURL);
    }
    async getAllOrders(filters) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            console.log('OrderService: Attempting to GET all orders with filters:', queryParams);
            const response = await this.api.get(`/?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('OrderService Error: Failed to get all orders:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

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

    async getOrderById(orderId) {
        try {
            const response = await this.api.get(`/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('OrderService Error: Failed to get order by id:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
    async updateOrderStatus(orderId, newStatus) {
        try {
            console.log(`OrderService: Attempting to PUT order ${orderId} status to ${newStatus}`);
            const response = await this.api.put(`/${orderId}/status`, { newStatus });
            return response.data;
        } catch (error) {
            console.error(`OrderService Error: Failed to update order status for ${orderId}:`, error.response ? error.response.data : error.message);
            throw error;
        }
    }
    async getRevenueSummary() {
        try {
            const response = await this.api.get('/revenue/sumary');
            return response.data;
        } catch (error) {
            console.error('OrderService Error: Failed to get revenue summary:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
    async getDailyRevenue() {
        try {
            const response = await this.api.get('/revenue/daily');
            return response.data;
        } catch (error) {
            console.error('OrderService Error: Failed to get daily revenue:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
    async getRevenuePerDayThisMonth() {
        try {
            const response = await this.api.get('/revenue/by-day');
            return response.data;
        } catch (error) {
            console.error('OrderService Error: Failed to get revenue per day this month:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

}

export default new OrderService();