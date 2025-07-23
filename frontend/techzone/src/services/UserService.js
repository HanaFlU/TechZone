import createApiClient from "../utils/api";


class UserService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/users`) {
        this.api = createApiClient(apiURL);
    }

    async getAccountInfo(userId) {
        try {
            console.log('StaffService: Fetching account info for staff ID:', userId);
            const response = await this.api.get(`/${userId}/account`);
            return response.data;
        } catch (error) {
            console.error('StaffService Error: Failed to fetch account info:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async updateAccountInfo(userId, userData) {
        try {
            console.log('StaffService: Updating account info for staff ID:', userId, 'Data:', userData);
            const response = await this.api.put(`/${userId}/account`, userData);
            return response.data;
        } catch (error) {
            console.error('StaffService Error: Failed to update account info:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
};

export default new UserService();