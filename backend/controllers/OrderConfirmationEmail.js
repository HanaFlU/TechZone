const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const OrderConfirmationEmail = async (order, customerEmail, customerName) => {
    try {
        if (!customerEmail) {
            console.warn(`[SendGrid] Không có email khách hàng để gửi xác nhận đơn hàng ${order.orderId}.`);
            return;
        }

        const primaryColor = '#328E6E';
        const headerBackgroundColor = 'rgb(116, 179, 157, 0.5)';
        const borderColor = '#d9d9d9';

        // Tạo HTML cho danh sách sản phẩm trong đơn hàng
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="border: 1px solid ${borderColor}; padding: 12px; text-align: left;">${item.product.name}</td>
                <td style="border: 1px solid ${borderColor}; padding: 12px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid ${borderColor}; padding: 12px; text-align: right;">${item.priceAtOrder.toLocaleString('vi-VN')} VND</td>
                <td style="border: 1px solid ${borderColor}; padding: 12px; text-align: right;">${(item.quantity * item.priceAtOrder).toLocaleString('vi-VN')} VND</td>
            </tr>
        `).join('');

        // Nội dung email đầy đủ bằng HTML
        const emailContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 800px; border: 1px solid ${primaryColor};">
                <div style="background-color: ${primaryColor}; padding: 30px 25px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 30px; font-weight: 600;">Xác Nhận Đơn Hàng Của Bạn</h1>
                    <p style="margin: 4px 0 0; font-size: 18px;">Mã đơn hàng: <strong>#${order.orderId}</strong></p>
                </div>

                <div style="padding: 0 20px;">
                    <p style="font-size: 16px;">Kính gửi ${customerName || 'Quý khách'},</p>
                    <p style="font-size: 16px; margin-bottom: 8px;">Cảm ơn bạn đã tin tưởng và đặt hàng tại <strong style="color: ${primaryColor};">${process.env.APP_NAME || 'TECHZONE'}</strong>! Đơn hàng của bạn đã được xác nhận thành công và sẽ sớm được xử lý trong thời gian ngắn nhất.</p>

                    <h3 style="color: ${primaryColor}; border-bottom: 2px solid ${borderColor}; padding-bottom: 10px; margin-top: 30px; margin-bottom: 15px; font-size: 20px;">Thông Tin Đơn Hàng</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 15px;">
                        <tr>
                            <th style="border: 1px solid ${borderColor}; padding: 12px; text-align: left; background-color: ${headerBackgroundColor}; width: 40%;">Mã Đơn Hàng:</th>
                            <td style="border: 1px solid ${borderColor}; padding: 12px;"><strong>#${order.orderId}</strong></td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid ${borderColor}; padding: 12px; text-align: left; background-color: ${headerBackgroundColor};">Ngày Đặt Hàng:</th>
                            <td style="border: 1px solid ${borderColor}; padding: 12px;">${new Date(order.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid ${borderColor}; padding: 12px; text-align: left; background-color: ${headerBackgroundColor};">Phương Thức Thanh Toán:</th>
                            <td style="border: 1px solid ${borderColor}; padding: 12px;">${order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod === 'CREDIT_CARD' ? 'Thẻ tín dụng' : 'Khác'}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid ${borderColor}; padding: 12px; text-align: left; background-color: ${headerBackgroundColor};">Trạng Thái Thanh Toán:</th>
                            <td style="border: 1px solid ${borderColor}; padding: 12px;">${order.paymentStatus === 'SUCCESSED' ? 'Đã Thanh Toán' : order.paymentStatus === 'PENDING' ? 'Chờ Thanh Toán' : 'Thất Bại'}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid ${borderColor}; padding: 12px; text-align: left; background-color: ${headerBackgroundColor};">Trạng Thái Đơn Hàng:</th>
                            <td style="border: 1px solid ${borderColor}; padding: 12px;">${order.status}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid ${borderColor}; padding: 12px; text-align: left; background-color: ${headerBackgroundColor};">Phí Vận Chuyển:</th>
                            <td style="border: 1px solid ${borderColor}; padding: 12px;">${order.shippingFee ? order.shippingFee.toLocaleString('vi-VN') + ' VND' : 'Miễn phí'}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid ${borderColor}; padding: 12px; text-align: left; background-color: ${headerBackgroundColor}; font-size: 18px;">Tổng Cộng:</th>
                            <td style="border: 1px solid ${borderColor}; padding: 12px;"><strong style="color: ${primaryColor}; font-size: 20px;">${order.totalAmount.toLocaleString('vi-VN')} VND</strong></td>
                        </tr>
                    </table>

                    <h3 style="color: ${primaryColor}; border-bottom: 2px solid ${borderColor}; padding-bottom: 10px; margin-top: 30px; margin-bottom: 15px; font-size: 20px;">Chi Tiết Sản Phẩm</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 15px;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid ${borderColor}; padding: 12px; text-align: left; background-color: ${headerBackgroundColor};">Tên Sản Phẩm</th>
                                <th style="border: 1px solid ${borderColor}; padding: 12px; text-align: center; background-color: ${headerBackgroundColor};">Số Lượng</th>
                                <th style="border: 1px solid ${borderColor}; padding: 12px; text-align: right; background-color: ${headerBackgroundColor};">Đơn Giá</th>
                                <th style="border: 1px solid ${borderColor}; padding: 12px; text-align: right; background-color: ${headerBackgroundColor};">Thành Tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <h3 style="color: ${primaryColor}; border-bottom: 2px solid ${borderColor}; padding-bottom: 10px; margin-top: 30px; margin-bottom: 15px; font-size: 20px;">Địa Chỉ Giao Hàng</h3>
                    <p style="margin-bottom: 15px; font-size: 15px;">
                        <strong>${order.shippingAddress?.fullName}</strong><br/>
                        Số điện thoại: ${order.shippingAddress?.phone}<br/>
                        ${order.shippingAddress?.street}, ${order.shippingAddress?.ward}, ${order.shippingAddress?.district}, ${order.shippingAddress?.city}
                        
                    </p>

                    <p style="font-size: 16px; margin-top: 20px;">Nếu bạn có bất kỳ câu hỏi nào về đơn hàng của mình, vui lòng liên hệ với chúng tôi qua email <a style="color: ${primaryColor}; text-decoration: none; font-weight: bold;">techzone@gmail.com</a> hoặc số điện thoại <strong style="color: ${primaryColor};">0123 456 789</strong>.</p>
                    <p style="font-size: 16px; margin-top: 4px;">Trân trọng,</p>
                </div>
            </div>
        `;

        const msg = {
            to: customerEmail,
            from: process.env.SENDGRID_SENDER_EMAIL,
            subject: `Xác nhận đơn hàng #${order.orderId} từ TECHZONE`,
            html: emailContent,
        };

        await sgMail.send(msg);
        console.log(`[SendGrid] Email xác nhận đơn hàng #${order.orderId} đã được gửi thành công đến ${customerEmail}.`);
    } catch (error) {
        console.error(`[SendGrid Error] Lỗi khi gửi email xác nhận đơn hàng #${order.orderId} đến ${customerEmail}:`, error.response ? error.response.body : error);
    }
};

module.exports = OrderConfirmationEmail;