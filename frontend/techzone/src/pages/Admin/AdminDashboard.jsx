import React, { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaUserFriends,
} from 'react-icons/fa';
import { BarChart } from '@mui/x-charts/BarChart';
import OrderService from '../../services/OrderService';
import CustomerService from '../../services/CustomerService';

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState({ days: [], revenues: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (value) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [customers, revenueSummary, revenueChart] = await Promise.all([
          CustomerService.getAllCustomers(),
          OrderService.getRevenueSummary(),
          OrderService.getRevenuePerDayThisMonth(), // <--- bạn cần tạo API này
        ]);

        // Stats
        setStats([
          {
            label: 'Hôm nay',
            value: formatCurrency(revenueSummary.today),
            icon: <FaShoppingCart size={30} color="#059669" />,
          },
          {
            label: 'Hôm qua',
            value: formatCurrency(revenueSummary.yesterday),
            icon: <FaShoppingCart size={30} color="#f87171" />,
          },
          {
            label: 'Tháng này',
            value: formatCurrency(revenueSummary.thisMonth),
            icon: <FaMoneyBillWave size={30} color="#10b981" />,
          },
          {
            label: 'Tháng trước',
            value: formatCurrency(revenueSummary.lastMonth),
            icon: <FaMoneyBillWave size={30} color="#6366f1" />,
          },
          {
            label: 'Tổng doanh thu',
            value: formatCurrency(revenueSummary.allTime),
            icon: <FaMoneyBillWave size={30} color="#f59e0b" />,
          },
          {
            label: 'Khách hàng mới',
            value: customers.length,
            icon: <FaUserFriends size={30} color="#2563eb" />,
          },
        ]);

        // Chart
        const chartDays = revenueChart.map(item => item.day); // dạng ['01', '02', ...]
        const chartValues = revenueChart.map(item => item.total); // dạng [200000, 500000, ...]
        setRevenueChartData({ days: chartDays, revenues: chartValues });
      } catch (err) {
        console.error(err);
        setError('Lỗi tải dữ liệu dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Tổng quan quản trị
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      {stat.icon}
                      <Box>
                        <Typography variant="h6">{stat.label}</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box mt={5}>
            <Typography variant="h5" gutterBottom>
              Biểu đồ doanh thu tháng này
            </Typography>
            <BarChart
              xAxis={[{ scaleType: 'band', data: revenueChartData.days }]}
              series={[{ data: revenueChartData.revenues, label: 'Doanh thu (VND)' }]}
              width={800}
              height={400}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default AdminDashboard;
