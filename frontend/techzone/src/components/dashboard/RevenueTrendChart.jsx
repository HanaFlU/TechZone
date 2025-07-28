import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, CircularProgress, Alert, Box,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import OrderService from '../../services/OrderService'; // Điều chỉnh đường dẫn

const RevenueTrendChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly', 'quarterly'

  useEffect(() => {
    const fetchRevenueTrend = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedData = await OrderService.getRevenueTrend(period);
        const formattedData = fetchedData.map(item => {
          let label = item._id;
          if (period === 'daily') {
            const dateParts = item._id.split('-');
            label = `${dateParts[2]}-${dateParts[1]}`;
          } else if (period === 'monthly') {
            const monthYearParts = item._id.split('-');
            label = `${monthYearParts[1]}/${monthYearParts[0]}`;
          } else if (period === 'weekly') {
            const weekYearParts = item._id.split('-');
            label = `Tuần ${weekYearParts[1]} ${weekYearParts[0]}`;
          } else if (period === 'quarterly') {
            label = item._id.replace('Q', 'Quý ');
          }
          return {
            name: label,
            DoanhThu: item.totalRevenue
          };
        });
        setData(formattedData);
      } catch (err) {
        setError('Không thể tải dữ liệu biểu đồ doanh thu.');
        console.error('Error fetching revenue trend:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenueTrend();
  }, [period]);

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color="success" />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, height: 400 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary">Không có dữ liệu doanh thu để hiển thị.</Typography>
      </Paper>
    );
  }

  return (
    <Box 
      sx={{ 
        my: 2, 
        p: 2, 
        bgcolor: '#fcfcfc', 
        borderRadius: '8px', 
        fontFamily: 'Roboto, sans-serif', 
        boxShadow: 1, 
      }}
    >
      <Box mb={2}> {/* Thêm margin-bottom cho toàn bộ phần header */}
        {/* Tên tiêu đề của biểu đồ */}
        <Typography
            variant="h6"
            color="main.primary"
            sx={{
                fontWeight: 'bold',
                mb: 2, // Thêm margin-bottom để tạo khoảng cách với RadioGroup
            }}
        >
          Biểu đồ doanh thu theo thời gian
        </Typography>

        {/* RadioGroup cho bộ lọc thời gian */}
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 0.5 }}>
            Xem theo:
          </FormLabel>
          <RadioGroup row value={period} onChange={handlePeriodChange}>
            <FormControlLabel value="daily" control={<Radio size="small" />} label="Ngày" />
            <FormControlLabel value="weekly" control={<Radio size="small" />} label="Tuần" />
            <FormControlLabel value="monthly" control={<Radio size="small" />} label="Tháng" />
            <FormControlLabel value="quarterly" control={<Radio size="small" />} label="Quý" />
          </RadioGroup>
        </FormControl>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => new Intl.NumberFormat('vi-VN').format(value)} />
          <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
          <Legend />
          <Line type="monotone" dataKey="DoanhThu" stroke="#328E6E" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RevenueTrendChart;