import createApiClient from "../utils/api";

class CustomerService {

    constructor(apiURL = `${import.meta.env.VITE_API_URL}/customers`) {
        this.api = createApiClient(apiURL);
    }
    async addCustomer(customerData) {
        try {
            console.log('CustomerService: Adding new customer with data:', customerData);
            const response = await this.api.post('/', customerData);
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to add customer:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async updateCustomer(userId, customerData) {
        try {
            console.log('StaffService: Updating account info for staff ID:', userId, 'Data:', customerData);
            const response = await this.api.put(`/${userId}/account`, customerData);
            return response.data;
        } catch (error) {
            console.error('StaffService Error: Failed to update account info:', error.response ? error.response.data : error.message);
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
    async getNotifications() {
        try {
            const response = await this.api.get('/notifications');
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to fetch notifications:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            const response = await this.api.put(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error(`CustomerService Error: Failed to mark notification ${notificationId} as read:`, error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async markAllNotificationsAsRead() {
        try {
            const response = await this.api.put('/notifications/mark-all-read');
            return response.data;
        } catch (error) {
            console.error('CustomerService Error: Failed to mark all notifications as read:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

export default new CustomerService();