import React, { useState, useEffect } from 'react';
import {
  Typography, CircularProgress, Alert, Box, // Box thay thế Paper cho các trạng thái
  Grid, Card
} from '@mui/material';
import OrderService from '../../services/OrderService';
import { IoCartOutline } from "react-icons/io5";
import {
  MdOutlinePendingActions,
  MdCheckCircleOutline,
  MdLocalShipping,
  MdDoneAll,
  MdCancel
} from "react-icons/md";

const statusDisplayNames = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const statusColors = {
  PENDING: '#FFC107',
  CONFIRMED: '#2196F3',
  SHIPPED: '#FF9800',
  DELIVERED: '#4CAF50',
  CANCELLED: '#F44336',
};

const statusIcons = {
  PENDING: MdOutlinePendingActions,
  CONFIRMED: MdCheckCircleOutline,
  SHIPPED: MdLocalShipping,
  DELIVERED: MdDoneAll,
  CANCELLED: MdCancel,
};

const OrderStatisticsCard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await OrderService.getOrderStatistics();
        setStatistics(data);
      } catch (err) {
        setError('Không thể tải thống kê đơn hàng.');
        console.error('Error fetching order statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 2, height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: 1 }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, height: 300, border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: 1 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!statistics || statistics.totalOrders === undefined || statistics.totalOrders === null) {
    return (
      <Box sx={{ p: 2, height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: 1 }}>
        <Typography variant="body1" color="text.secondary">
          Không có dữ liệu thống kê đơn hàng.
        </Typography>
      </Box>
    );
  }

  const sortedStatusKeys = [
    'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  ];

  return (
    <Grid container spacing={2} sx={{ p: 0, m: 1, width: '100%' }}>

      {/* Card cho Tổng số đơn hàng */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <Card
          sx={{
            minWidth: { xs: 'auto', sm: 160 },
            width: '100%',
            p: 1,
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: '8px',
            boxShadow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            bgcolor: 'background.paper',
            height: '100%'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IoCartOutline
              style={{
                textAlign: 'center',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                marginRight: '12px',
                display: 'inline-block',
                padding: '8px',
                color: '#fb923c',
                backgroundColor: '#fed7aa'
              }}
            />
            <Box sx={{ p: 0.5 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.875rem', fontWeight: 'medium' }}>
                Tổng đơn
              </Typography>
              <Typography variant="h5" sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 'normal', color: 'text.primary' }}>
                {statistics.totalOrders}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Các Card cho từng trạng thái đơn hàng */}
      {sortedStatusKeys.map((statusKey) => {
        const item = statistics.ordersByStatus.find(s => s.status === statusKey);
        const count = item ? item.count : 0;
        const displayName = statusDisplayNames[statusKey] || statusKey;
        const color = statusColors[statusKey] || 'grey';
        const IconComponent = statusIcons[statusKey] || IoCartOutline;

        const percentage = statistics.totalOrders > 0
          ? ((count / statistics.totalOrders) * 100).toFixed(1)
          : 0;

        return (
          <Grid key={statusKey} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <Card
              sx={{
                minWidth: { xs: 'auto', sm: 160 },
                width: '100%',
                p: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: '8px',
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                bgcolor: 'background.paper',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <IconComponent
                  style={{
                    textAlign: 'center',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    marginRight: '12px',
                    display: 'inline-block',
                    padding: '8px',
                    color: color,
                    backgroundColor: `${color}20`
                  }}
                />
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.875rem', fontWeight: 'medium' }}>
                    {displayName}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                    <Typography variant="h5" sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 'normal', color: 'text.primary' }}>
                      {count}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                      ({percentage}%)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default OrderStatisticsCard;