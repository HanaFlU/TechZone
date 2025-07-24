import createApiClient from "../utils/api";


class UploadService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/upload`) {
        this.api = createApiClient(apiURL);
    }
    async uploadIcon(file) {
        try {
            const formData = new FormData();
            formData.append("icon", file);
            console.log("Uploading icon with formData:", formData);
            const response = await this.api.post("/icon", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return response.data.url;
        } catch (error) {
            console.error('UploadService Error: Failed to upload icon:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

};

export default new UploadService();