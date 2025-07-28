import createApiClient from "../utils/api";


class UserService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/users`) {
        this.api = createApiClient(apiURL);
    }

    async getAccountInfo(userId) {
        try {
            console.log('UserService: Fetching account info for user ID:', userId);
            const response = await this.api.get(`/${userId}/account`);
            console.log('UserService: Account info fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('StaffService Error: Failed to fetch account info:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async updateAccountInfo(userId, userData) {
        try {
            console.log('UserService: Updating account info for user ID:', userId, 'Data:', userData);
            const response = await this.api.put(`/${userId}/account`, userData);
            return response.data;
        } catch (error) {
            console.error('StaffService Error: Failed to update account info:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async saveChatHistory(chatEntry) {
        try {
            const response = await this.api.post('/chat-history', chatEntry);
            return response.data;
        } catch (error) {
            console.error('UserService Error: Failed to save chat history:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getChatHistory() {
        try {
            const response = await this.api.get('/chat-history');
            return response.data;
        } catch (error) {
            console.error('UserService Error: Failed to fetch chat history:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
};

export default new UserService();