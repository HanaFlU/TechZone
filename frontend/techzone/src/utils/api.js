import axios from 'axios';

// Hàm này tạo một instance Axios đã được cấu hình
const createApiClient = (baseURL) => {
    return axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            // Có thể thêm Authorization header ở đây nếu bạn có token
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        timeout: 10000, // Timeout sau 10 giây
    });
};

export default createApiClient;