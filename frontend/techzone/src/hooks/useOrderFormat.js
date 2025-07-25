export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return "N/A";
    }
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

export const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (e) {
        console.error("Lỗi định dạng thời gian:", e);
        return "";
    }
};

export const formatDateOnly = (isoString) => {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        console.error("Lỗi định dạng ngày:", e);
        return "";
    }
};
export const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(',', '');
};

export const getStatusDisplayName = (status) => {
    switch (status) {
        case "PENDING": return "Chờ xác nhận";
        case "CONFIRMED": return "Đã xác nhận";
        case "SHIPPED": return "Đang giao hàng";
        case "DELIVERED": return "Đã giao hàng";
        case "CANCELLED": return "Đã hủy";
        default: return status;
    }
};

export const getPaymentMethodName = (method) => {
    switch (method) {
        case "COD": return "Thanh toán khi nhận hàng";
        case "CREDIT_CARD": return "Thẻ tín dụng/Ghi nợ";
        case "E_WALLET": return "Ví điện tử";
        default: return method;
    }
};
export const getPaymentStatusName = (status) => {
    switch (status) {
        case 'SUCCESSED': return 'Success';
        case 'PENDING': return 'Pending';
        case 'FAILED': return 'Failed';
        default: return 'Unknown';
    }
};
export const getStatusChipColor = (status) => {
    switch (status) {
        case 'PENDING':
            return 'warning';
        case 'CONFIRMED':
            return 'info';
        case 'SHIPPED':
            return 'primary';
        case 'DELIVERED':
            return 'success';
        case 'CANCELLED':
            return 'error';
        default:
            return 'default';
    }
};