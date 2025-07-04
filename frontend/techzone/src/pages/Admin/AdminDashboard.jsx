import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert } from '@mui/material';
import { FaShoppingCart, FaUserFriends, FaMoneyBillWave } from 'react-icons/fa';
import CustomerService from '../../services/CustomerService';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Đơn hàng hôm nay', value: 0, icon: <FaShoppingCart size={40} color="#059669" /> },
    { label: 'Khách hàng mới', value: 0, icon: <FaUserFriends size={40} color="#2563eb" /> },
    { label: 'Doanh thu hôm nay', value: '0₫', icon: <FaMoneyBillWave size={40} color="#f59e42" /> },
  ]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lấy danh sách khách hàng
        const customers = await CustomerService.getAllCustomers();
        // Lấy đơn hàng gần đây (giả sử có hàm getRecentOrders, nếu chưa có thì dùng dữ liệu mẫu)
        // const ordersRes = await OrderService.getRecentOrders();
        // setOrders(ordersRes);
        // Demo: lấy 3 khách hàng mới nhất làm orders mẫu
        setOrders(customers.slice(-3).map((cus) => ({
          id: cus._id,
          customer: cus.user && typeof cus.user === 'object' ? cus.user.name : '',
          email: cus.user && typeof cus.user === 'object' ? cus.user.email : '',
          date: cus.createdAt ? new Date(cus.createdAt).toLocaleDateString() : '',
          total: 'N/A',
          status: cus.user && typeof cus.user === 'object' && cus.user.isActive ? 'Active' : 'Inactive',
          statusColor: cus.user && typeof cus.user === 'object' && cus.user.isActive ? 'success.main' : 'text.secondary',
        })));
        setStats([
          { label: 'Đơn hàng hôm nay', value: 120, icon: <FaShoppingCart size={40} color="#059669" /> },
          { label: 'Khách hàng mới', value: customers.length, icon: <FaUserFriends size={40} color="#2563eb" /> },
          { label: 'Doanh thu hôm nay', value: '8.500.000₫', icon: <FaMoneyBillWave size={40} color="#f59e42" /> },
        ]);
      } catch (e) {
        setError('Không thể tải dữ liệu dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
        Bảng điều khiển quản trị
      </Typography>
      {loading ? (
        <CircularProgress color="success" />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Grid container spacing={3} mb={4}>
            {stats.map((stat, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card elevation={3}>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {stat.icon}
                    <Typography variant="h5" fontWeight="bold" color="success.main" mt={1}>{stat.value}</Typography>
                    <Typography color="text.secondary">{stat.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                Khách hàng mới nhất
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                      <TableCell>ID</TableCell>
                      <TableCell>Họ tên</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                      <TableCell>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.email}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Typography fontWeight="bold" sx={{ color: order.statusColor }}>{order.status}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;