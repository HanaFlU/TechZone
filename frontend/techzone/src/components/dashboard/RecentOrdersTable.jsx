import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button 
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import OrderService from '../../services/OrderService';

const statusDisplayNames = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  CANCELLED: 'Đã hủy',
};

const statusColors = {
  PENDING: '#FFC107',
  CONFIRMED: '#2196F3',
  SHIPPED: '#FF9800',
  DELIVERED: '#4CAF50',
  CANCELLED: '#F44336',
};

const paymentMethodDisplayNames = {
  COD: 'COD',
  CREDIT_CARD: 'Credit Card',
  E_WALLET: 'Ví điện tử',
};

const paymentStatusDisplayNames = {
  PENDING: 'Đang chờ',
  SUCCESSED: 'Thành công',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
};


const RecentOrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const recentOrders = await OrderService.getAllOrders({
          limit: 10 
        });
        
        setOrders(recentOrders.orders || []); 

      } catch (err) {
        setError('Không thể tải danh sách đơn hàng gần đây.');
        console.error('Error fetching recent orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const handleReviewOrdersClick = () => {
    navigate('/admin/orders'); 
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, minHeight: 200 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Typography variant="body1" color="text.secondary">
          Không có đơn hàng gần đây nào.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, p: 2}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography 
          variant="h5"
          sx={{ 
            fontWeight: 'bold',
            mb: 0
          }}
        > 
          Đơn Hàng Gần Đây Nhất
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleReviewOrdersClick}
          sx={{
            bgcolor: '#328E6E', 
            '&:hover': {
              bgcolor: '#28735A', 
            },
              color: '#fff',
          }}
        >
          Duyệt Đơn Hàng
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 0, border: '1px solid', borderColor: 'grey.200', shadow: 2 }}>
        <Table sx={{ minWidth: 650, shadow: 2}} aria-label="recent orders table">
          <TableHead>
            <TableRow sx={{ bgcolor: '#e0f2f1' }}>
              <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>Ngày Đặt Hàng</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>Khách Hàng</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>Thanh Toán</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>Tổng Tiền</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>Mã Đơn Hàng</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>{order.customer?.user?.name || 'N/A'}</TableCell>
                <TableCell>
                  {paymentMethodDisplayNames[order.paymentMethod] || order.paymentMethod} ({paymentStatusDisplayNames[order.paymentStatus] || order.paymentStatus})
                </TableCell>
                <TableCell align="right">
                  {order.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: '4px',
                      bgcolor: statusColors[order.status] ? `${statusColors[order.status]}20` : 'grey.200',
                      color: statusColors[order.status] || 'text.primary',
                      fontWeight: 'medium',
                      fontSize: '0.8rem',
                    }}
                  >
                    {statusDisplayNames[order.status] || order.status}
                  </Box>
                </TableCell>
                 <TableCell component="th" scope="row">
                  {order.orderId}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RecentOrdersTable;