import createApiClient from "../utils/api";

class CustomerService {

    constructor(apiURL = `${import.meta.env.VITE_API_URL}/customers`) {
        this.api = createApiClient(apiURL);
    }
    async getAccountInfo(userId) {
        try {
            console.log('CustomerService: Fetching account info for customer ID:', userId);
            const response = await this.api.get(`/${userId}/account`);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to fetch account info:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async updateAccountInfo(userId, userData) {
        try {
            console.log('CustomerService: Updating account info for customer ID:', userId, 'Data:', userData);
            const response = await this.api.put(`/${userId}/account`, userData);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to update account info:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getCustomerByUserId(userId) {
        try {
            console.log('CustomerService: Fetching customer by User ID:', userId);
            const response = await this.api.get(`/by-user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to fetch customer by user ID:', error.response ? error.response.data : error.message);
            throw error;
        }
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
    async getAddressById(addressId) {
        try {
            const response = await this.api.get(`/address/${addressId}`);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to fetch address by ID:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
    async addAddress(customerId, addressData) {
        try {
            const response = await this.api.post(`/${customerId}/address`, addressData);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to add address:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
    async updateAddress(addressId, addressData) {
        try {
            const response = await this.api.put(`/address/${addressId}`, addressData);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to update address:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async deleteAddress(customerId, addressId) {
        try {
            const response = await this.api.delete(`/${customerId}/address/${addressId}`);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to delete address:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getOrdersByCustomer(customerId) {
        try {
            const response = await this.api.get(`/orders/customer/${customerId}`);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to fetch orders by customer:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getAllCustomers() {
        try {
            const response = await this.api.get(`/`);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to fetch all customers:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async deleteCustomer(customerId) {
        try {
            const response = await this.api.delete(`/${customerId}`);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to delete customer:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

export default new CustomerService();