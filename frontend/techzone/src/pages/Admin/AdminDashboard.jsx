// Ví dụ về cấu trúc Dashboard.js
import React from 'react';
import { Typography, Grid, Paper, Box, Card } from '@mui/material';
import RevenueSummaryCard from '../../components/dashboard/RevenueSumaryCard';
import OrderStatisticsCard from '../../components/dashboard/OrderStatisticsCard';
import RevenueTrendChart from '../../components/dashboard/RevenueTrendChart';
// import TopSellingProductsTable from './TopSellingProductsTable';
import RecentOrdersTable from '../../components/dashboard/RecentOrdersTable';
import TopProductsReport from '../../components/dashboard/TopProductsReport';

const Dashboard = () => {
  return (
    <Card sx={{ minWidth: 275, padding: 2 }}>
      <Box sx={{ flexGrow: 1, p: 3, m: 0 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#328E6E' }}>
          Dashboard Overview
        </Typography>
        <Grid container>
          {/* Hàng 1: Doanh thu tổng quan */}
          <Grid size={{ xs: 12 }}>
            <RevenueSummaryCard />
          </Grid>

          {/* Hàng 2: Thống kê Order */}
          <Grid  size={{ xs: 12}}>
            <OrderStatisticsCard/>
          </Grid>

          {/* Hàng 3: Biểu đồ doanh thu */}
          <Grid size={{ xs: 12}}>
            <RevenueTrendChart />
          </Grid>

          {/* Hàng 4: Bảng xếp hạng và đơn hàng gần đây */}
          <Grid  size={{ xs: 12}}>
              {/* Bảng xếp hạng sản phẩm có doanh thu cao nhất */}
              <TopProductsReport />
          </Grid>
          <Grid  size={{ xs: 12}}>
              {/* Bảng các order gần đây nhất */}
              <RecentOrdersTable />
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

export default Dashboard;