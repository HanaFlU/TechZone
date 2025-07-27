import React, { useState, useEffect } from 'react';
import { Paper, Typography, CircularProgress, Alert, Box, Grid, Card } from '@mui/material';
import { CiCalendarDate } from "react-icons/ci";
import { CgCalendarToday } from "react-icons/cg";
import { LiaCalendarDaySolid } from "react-icons/lia";
import { TbCalendarMonthFilled } from "react-icons/tb";
import { TbSum } from "react-icons/tb";

import OrderService from '../../services/OrderService'; // Điều chỉnh đường dẫn

const RevenueSummary = () => {
  const [summary, setSummary] = useState({
    today: 0,
    yesterday: 0,
    thisMonth: 0,
    lastMonth: 0,
    allTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await OrderService.getRevenueSummary();
        setSummary(data);
        console.log('Revenue summary data:', summary);
      } catch (err) {
        setError('Không thể tải dữ liệu tổng quan.');
        console.error('Error fetching revenue summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color="success" />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2} sx={{ p: 0, my: 1, width: '100%' }}>
      <Grid size={{ xs: 12,sm: 6, md: 2.4 }}>
        <Card class="min-w-40 w-full p-4 border border-gray-200 rounded-lg shadow-sm justify-between text-center items-center text-white bg-teal-600 xl:mb-0 mb-3">
          <CiCalendarDate class="text-center inline-block text-3xl text-white dark:text-emerald-100 bg-teal-600" />
          <Typography class="mb-3 text-base font-medium text-gray-50 dark:text-gray-100">Today</Typography>
          <Typography class="text-2xl font-bold leading-none text-gray-50 dark:text-gray-50">
            {formatCurrency(summary.today)}
          </Typography>
        </Card>
      </Grid>
      <Grid  size={{ xs: 12,sm: 6, md: 2.4 }}>
        <Card class="min-w-40 w-full p-4 border border-gray-200 rounded-lg shadow-sm justify-between text-center items-center text-white bg-amber-600 xl:mb-0 mb-3">
          <CgCalendarToday class="text-center inline-block text-3xl text-white dark:text-emerald-100 bg-amber-600" />
          <Typography class="mb-3 text-base font-medium text-gray-50 dark:text-gray-100">Yesterday</Typography>
          <Typography class="text-2xl font-bold leading-none text-gray-50 dark:text-gray-50">
            {formatCurrency(summary.yesterday)}
          </Typography>
        </Card>
      </Grid>
      <Grid  size={{ xs: 12,sm: 6, md: 2.4 }}>
        <Card class="min-w-40 w-full p-4 border border-gray-200 rounded-lg shadow-sm justify-between text-center items-center text-white bg-blue-600 xl:mb-0 mb-3">
          <TbCalendarMonthFilled class="text-center inline-block text-3xl text-white dark:text-emerald-100 bg-blue-600" />
          <Typography class="mb-3 text-base font-medium text-gray-50 dark:text-gray-100">This Month</Typography>
          <Typography class="text-2xl font-bold leading-none text-gray-50 dark:text-gray-50">
            {formatCurrency(summary.thisMonth)}
          </Typography>
        </Card>
      </Grid>
      <Grid  size={{ xs: 12,sm: 6, md: 2.4 }}>
        <Card class="min-w-40 w-full p-4 border border-gray-200 rounded-lg shadow-sm justify-between text-center items-center text-white bg-emerald-500 xl:mb-0 mb-3">
          <LiaCalendarDaySolid class="text-center inline-block text-3xl text-white dark:text-emerald-100 bg-emerald-500" />
          <Typography class="mb-3 text-base font-medium text-gray-50 dark:text-gray-100">Last Month</Typography>
          <Typography class="text-2xl font-bold leading-none text-gray-50 dark:text-gray-50">
            {formatCurrency(summary.lastMonth)}
          </Typography>
        </Card>
      </Grid>
      <Grid  size={{ xs: 12, md: 2.4 }}>
        <Card class="min-w-40 w-full p-4 border border-gray-200 rounded-lg shadow-sm justify-between text-center items-center text-white bg-green-800 xl:mb-0 mb-3">
          <TbSum  class="text-center inline-block text-3xl text-white dark:text-emerald-100 bg-green-800" />
          <Typography class="mb-3 text-base font-medium text-gray-50 dark:text-gray-100">Total Revenue</Typography>
          <Typography class="text-2xl font-bold leading-none text-gray-50 dark:text-gray-50">
            {formatCurrency(summary.allTime)}
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );
};

export default RevenueSummary;