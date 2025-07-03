import createApiClient from "../utils/api";

class CustomerService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/customers`) {
        this.api = createApiClient(apiURL);
    }

    /**
     * Lấy thông tin chi tiết của một khách hàng bao gồm các địa chỉ giao hàng.
     * Tương ứng với GET /api/customers/:customerId/addresses
     * @param {string} customerId - ID của khách hàng.
     * @returns {Promise<object>} Dữ liệu khách hàng đã populate addresses.
     */
    async getAddresses(customerId) {
        try {
            console.log('CustomerService: Fetching addresses for customer ID:', customerId);
            const response = await this.api.get(`/${customerId}/addresses`);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to fetch customer addresses:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

export default new CustomerService();