import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert } from '@mui/material';
import OrderService from '../../../services/OrderService';

const AdminCustomerOrderList = () => {
  const { customerId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await OrderService.getOrdersByCustomer(customerId);
        setOrders(data.orders || []);
        setCustomer(data.customer || null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải danh sách đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [customerId]);

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" color="success.main" fontWeight="bold" gutterBottom>
          Đơn hàng của khách hàng
        </Typography>
        {customer && (
          <Typography color="text.secondary" mb={2}>
            {customer.name} ({customer.email})
          </Typography>
        )}
        {loading ? (
          <CircularProgress color="success" />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Không có đơn hàng nào.</TableCell>
                  </TableRow>
                ) : (
                  orders.map(order => (
                    <TableRow key={order._id}>
                      <TableCell>{order._id}</TableCell>
                      <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</TableCell>
                      <TableCell>{order.total ? order.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : ''}</TableCell>
                      <TableCell>{order.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCustomerOrderList;
