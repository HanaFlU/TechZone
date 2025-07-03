import createApiClient from "../utils/api";


class AuthService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/auth`) {
        this.api = createApiClient(apiURL);
    }

    async login({ email, password }) {
        try {
            const response = await this.api.post("/login", { email, password });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async register(userData) {
        try {
            const response = await this.api.post("/register", userData);
            console.log("Response from register:", response);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async googleLogin(userData) {
        try {
            const response = await this.api.post("/google", userData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async logout() {
        try {
            const response = await this.api.post("/logout");
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async forgotPassword(email) {
        try {
            const response = await this.api.post("/forgot-password", { email });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const response = await this.api.post("/reset-password", { token, newPassword });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

export default new AuthService();