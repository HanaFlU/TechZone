const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const OrderConfirmationEmail = async (order, customerEmail, customerName) => {
    try {
        if (!customerEmail) {
            console.warn(`[SendGrid] Không có email khách hàng để gửi xác nhận đơn hàng ${order.orderId}.`);
            return;
        }

        // Tạo HTML cho danh sách sản phẩm trong đơn hàng
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.product.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.priceAtOrder.toLocaleString('vi-VN')} VND</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${(item.quantity * item.priceAtOrder).toLocaleString('vi-VN')} VND</td>
            </tr>
        `).join('');

        // Nội dung email đầy đủ bằng HTML
        const emailContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #0056b3;">Xác Nhận Đơn Hàng Của Bạn #${order.orderId
            }</h2>
                <p>Kính gửi ${customerName || "Quý khách"},</p>
                <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi! Đơn hàng của bạn sẽ sớm được nhân viên xác nhận và sẽ được xử lý trong thời gian ngắn nhất.</p>

                <h3>Thông Tin Đơn Hàng:</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Mã Đơn Hàng:</th>
                        <td style="border: 1px solid #ddd; padding: 8px;"><strong>#${order.orderId
            }</strong></td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Ngày Đặt Hàng:</th>
                        <td style="border: 1px solid #ddd; padding: 8px;">${new Date(
                order.createdAt
            ).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
            })}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Tổng Tiền:</th>
                        <td style="border: 1px solid #ddd; padding: 8px;"><strong>${order.totalAmount.toLocaleString(
                "vi-VN"
            )} VND</strong></td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Phương Thức Thanh Toán:</th>
                        <td style="border: 1px solid #ddd; padding: 8px;">${order.paymentMethod === "COD"
                ? "Thanh toán khi nhận hàng (COD)"
                : order.paymentMethod === "CREDIT_CARD"
                    ? "Thẻ tín dụng"
                    : "Khác"
            }</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Trạng Thái Thanh Toán:</th>
                        <td style="border: 1px solid #ddd; padding: 8px;">${order.paymentStatus === "SUCCESSED"
                ? "Đã Thanh Toán"
                : order.paymentStatus === "PENDING"
                    ? "Chờ Thanh Toán"
                    : "Thất Bại"
            }</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Trạng Thái Đơn Hàng:</th>
                        <td style="border: 1px solid #ddd; padding: 8px;">${order.status
            }</td>
                    </tr>
                </table>

                <h3>Chi Tiết Sản Phẩm:</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Sản Phẩm</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Số Lượng</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Giá Đơn Vị</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Thành Tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <h3>Địa Chỉ Giao Hàng:</h3>
                <p>
                    ${order.shippingAddress?.fullName}<br/>
                    ${order.shippingAddress?.street}, ${order.shippingAddress?.ward
            }, ${order.shippingAddress?.district}, ${order.shippingAddress?.city
            }<br/>
                    Điện thoại: ${order.shippingAddress?.phone}
                </p>

                <p>Chúng tôi sẽ sớm xử lý đơn hàng của bạn. Bạn có thể kiểm tra trạng thái đơn hàng của mình tại tài khoản của bạn.</p>
                <p>Trân trọng,</p>
                <p>Đội ngũ TECHZONE</p>
            </div>
        `;

        const msg = {
            to: customerEmail,
            from: process.env.SENDGRID_SENDER_EMAIL,
            subject: `Xác nhận đơn hàng #${order.orderId} từ TECHZONE}`,
            html: emailContent,
        };

        await sgMail.send(msg);
        console.log(`[SendGrid] Email xác nhận đơn hàng #${order.orderId} đã được gửi thành công đến ${customerEmail}.`);
    } catch (error) {
        console.error(`[SendGrid Error] Lỗi khi gửi email xác nhận đơn hàng #${order.orderId} đến ${customerEmail}:`, error.response ? error.response.body : error);
    }
};

module.exports = OrderConfirmationEmail;