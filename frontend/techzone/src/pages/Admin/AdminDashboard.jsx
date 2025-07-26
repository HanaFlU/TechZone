// Ví dụ về cấu trúc Dashboard.js
import React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
// Import các component con cho từng phần của dashboard
// import RevenueSummaryCard from './RevenueSummaryCard';
// import OrderStatusChart from './OrderStatusChart';
// import DailyRevenueChart from './DailyRevenueChart';
// import TopSellingProductsTable from './TopSellingProductsTable';
// import RecentOrdersTable from './RecentOrdersTable';

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tổng quan Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Hàng 1: Doanh thu tổng quan */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Doanh thu hôm nay</Typography>
            {/* Component hiển thị doanh thu theo ngày */}
            {/* <DailyRevenueCard /> */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Doanh thu tháng này</Typography>
            {/* Component hiển thị doanh thu theo tháng */}
            {/* <MonthlyRevenueCard /> */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Tổng doanh thu</Typography>
            {/* Component hiển thị tổng doanh thu từ trước đến nay */}
            {/* <TotalRevenueCard /> */}
          </Paper>
        </Grid>

        {/* Hàng 2: Thống kê Order */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Tổng số đơn hàng</Typography>
            {/* Component hiển thị tổng số order */}
            {/* <TotalOrdersCard /> */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Đơn hàng theo trạng thái</Typography>
            {/* Biểu đồ số lượng order liệt kê theo từng trạng thái */}
            {/* <OrderStatusChart /> */}
          </Paper>
        </Grid>

        {/* Hàng 3: Biểu đồ doanh thu */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Doanh thu theo thời gian</Typography>
            {/* Biểu đồ doanh thu theo tuần/tháng/quý (có thể là một biểu đồ đường) */}
            {/* <RevenueTrendChart /> */}
          </Paper>
        </Grid>

        {/* Hàng 4: Bảng xếp hạng và đơn hàng gần đây */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Sản phẩm bán chạy nhất</Typography>
            {/* Bảng xếp hạng sản phẩm có doanh thu cao nhất */}
            {/* <TopSellingProductsTable /> */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Đơn hàng gần đây</Typography>
            {/* Bảng các order gần đây nhất */}
            {/* <RecentOrdersTable /> */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;