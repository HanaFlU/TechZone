import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';

const AdminStaff = () => {
  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" color="success.main" fontWeight="bold" gutterBottom>
          Quản lý nhân viên
        </Typography>
        <Typography color="text.secondary">
          Trang quản lý danh sách nhân viên. (Bạn có thể bổ sung bảng, tìm kiếm, filter...)
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AdminStaff;
