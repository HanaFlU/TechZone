import React from 'react';

// Hàm helper để định dạng ngày giờ
const formatDateTime = (isoString) => {
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

// Hàm helper để lấy tên hiển thị trạng thái
const getStatusDisplayName = (status) => {
    switch (status) {
        case 'PENDING': return 'Chờ xác nhận';
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'SHIPPED': return 'Đang giao hàng';
        case 'DELIVERED': return 'Đã giao hàng';
        case 'CANCELLED': return 'Đã hủy';
        default: return status;
    }
};

const InvoicePrintView = React.forwardRef(({ order }, ref) => {
    if (!order) {
        // Có thể hiển thị một thông báo hoặc trả về null nếu không có dữ liệu
        return <div style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu hóa đơn để in.</div>;
    }

    // Lấy thông tin cần thiết từ đối tượng order
    const customerName = order.customer?.user?.name || 'N/A';
    const customerEmail = order.customer?.user?.email || 'N/A';
    const shippingAddress = order.shippingAddress?.fullAddress || 'N/A';
    const phoneNumber = order.customer?.user?.phoneNumber || 'N/A';
    const orderDate = formatDateTime(order.createdAt);
    const paymentMethod = order.paymentMethod === 'COD' ? 'COD' :
                          order.paymentMethod === 'CREDIT_CARD' ? 'Thẻ tín dụng' : 'Ví điện tử';
    const totalAmount = order.totalAmount.toLocaleString('vi-VN') + ' VND';

    // Tạo danh sách sản phẩm
    const productsHtml = order.products.map(item => (
        <tr key={item.product?._id || item._id}> {/* Sử dụng _id của sản phẩm hoặc _id của item làm key duy nhất */}
            <td>{item.product?.name || 'Sản phẩm không rõ'}</td>
            <td>{item.quantity}</td>
            <td style={{ textAlign: 'right' }}>{item.price.toLocaleString('vi-VN')} VND</td>
            <td style={{ textAlign: 'right' }}>{(item.quantity * item.price).toLocaleString('vi-VN')} VND</td>
        </tr>
    ));

    return (
        // Gắn ref vào phần tử gốc của component này để react-to-print có thể truy cập
        <div ref={ref} style={{ margin: '0', padding: '0', boxSizing: 'border-box', width: '100%' }}>
            {/* Inline style cho việc in ấn */}
            <style type="text/css" media="print">
                {`
                    @page {
                        size: A4; /* Đảm bảo kích thước trang là A4 */
                        margin: 0; /* Loại bỏ lề mặc định của trình duyệt */
                    }
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 0; /* Quan trọng: Loại bỏ margin của body khi in */
                        padding: 20px; /* Thêm padding tùy chỉnh cho nội dung hóa đơn */
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact; /* Đảm bảo màu sắc được in chính xác trên WebKit */
                        print-color-adjust: exact; /* Đảm bảo màu sắc được in chính xác trên các trình duyệt khác */
                    }
                    .container {
                        width: 100%;
                        max-width: 794px; /* Khoảng rộng A4 ở 96dpi, có thể điều chỉnh */
                        margin: 0 auto; /* Căn giữa hóa đơn trên trang */
                        padding: 20px; /* Padding bên trong container */
                        box-sizing: border-box;
                    }
                    .header { text-align: center; margin-bottom: 20px; }
                    .header h1 { margin: 0; color: #328E6E; } /* Màu xanh lá cây của bạn */
                    .invoice-details, .customer-details {
                        margin-bottom: 20px;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 10px;
                    }
                    .invoice-details div, .customer-details div { margin-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    table th { background-color: #f2f2f2; }
                    .total { text-align: right; font-weight: bold; font-size: 14px; margin-top: 10px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #777; }
                    .text-right { text-align: right; }
                    .no-print { display: none; } /* Để ẩn các phần tử không muốn in nếu có */
                `}
            </style>
            <div className="container">
                <div className="header">
                    <h1>Hóa đơn bán hàng</h1>
                    <p>Mã đơn hàng: <strong>#{order.orderId}</strong></p>
                </div>

                <div className="invoice-details">
                    <div><strong>Ngày đặt hàng:</strong> {orderDate}</div>
                    <div><strong>Phương thức thanh toán:</strong> {paymentMethod}</div>
                    <div><strong>Trạng thái:</strong> {getStatusDisplayName(order.status)}</div>
                </div>

                <div className="customer-details">
                    <h2>Thông tin khách hàng</h2>
                    <div><strong>Tên khách hàng:</strong> {customerName}</div>
                    <div><strong>Email:</strong> {customerEmail}</div>
                    <div><strong>Số điện thoại:</strong> {phoneNumber}</div>
                    <div><strong>Địa chỉ giao hàng:</strong> {shippingAddress}</div>
                </div>

                <h2>Chi tiết đơn hàng</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th className="text-right">Đơn giá</th>
                            <th className="text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productsHtml}
                    </tbody>
                </table>

                <div className="total">
                    Tổng cộng: {totalAmount}
                </div>

                <div className="footer">
                    <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!</p>
                    <p>Liên hệ: [Email hoặc số điện thoại cửa hàng của bạn]</p>
                </div>
            </div>
        </div>
    );
});

export default InvoicePrintView;