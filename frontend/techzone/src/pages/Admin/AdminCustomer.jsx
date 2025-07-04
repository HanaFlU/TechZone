import React, { useState, useEffect } from 'react';
import { Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Alert } from '@mui/material';
import { FaUserPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CustomerService from '../../services/CustomerService';

const CustomerAdmin = () => {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState({ name: '', email: '', phone: '' });
  const [editDialog, setEditDialog] = useState({ open: false, customer: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Gọi API lấy danh sách customer (có thể cần chỉnh lại endpoint cho phù hợp backend)
        const res = await CustomerService.api.get('/');
        setCustomers(res.data);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Không thể tải danh sách khách hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredCustomers = customers.filter(c =>
    (c.user?.name || '').toLowerCase().includes(filter.name.toLowerCase()) &&
    (c.user?.email || '').toLowerCase().includes(filter.email.toLowerCase()) &&
    (c.user?.phone || '').includes(filter.phone)
  );

  const handleEdit = (customer) => {
    setEditDialog({ open: true, customer: { ...customer } });
  };

  const handleEditChange = (e) => {
    setEditDialog({ ...editDialog, customer: { ...editDialog.customer, user: { ...editDialog.customer.user, [e.target.name]: e.target.value } } });
  };

  const handleEditSave = async () => {
    try {
      setLoading(true);
      await CustomerService.updateAccountInfo(editDialog.customer.user._id, editDialog.customer.user);
      // Cập nhật lại danh sách sau khi sửa
      const res = await CustomerService.api.get('/');
      setCustomers(res.data);
      setEditDialog({ open: false, customer: null });
    } catch (err) {
      console.error('Error updating customer:', err);
      alert('Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customer) => {
    if (window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      try {
        setLoading(true);
        // Gọi API xóa user/customer ở đây nếu backend hỗ trợ
        await CustomerService.api.delete(`/${customer._id}`);
        setCustomers(customers.filter(c => c._id !== customer._id));
      } catch (err) {
        console.error('Error deleting customer:', err);
        alert('Xóa thất bại!');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewOrders = (customer) => {
    navigate(`/admin/customer-order/${customer._id}`);
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography variant="h5" color="success.main" fontWeight="bold">
            Quản lý khách hàng
          </Typography>
          <Button variant="contained" color="success" startIcon={<FaUserPlus />}>
            Thêm khách hàng
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <TextField label="Lọc theo tên" name="name" value={filter.name} onChange={handleFilterChange} size="small" />
          <TextField label="Lọc theo email" name="email" value={filter.email} onChange={handleFilterChange} size="small" />
          <TextField label="Lọc theo SĐT" name="phone" value={filter.phone} onChange={handleFilterChange} size="small" />
        </div>
        {loading ? (
          <CircularProgress color="success" />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>{customer._id}</TableCell>
                    <TableCell>{customer.user?.name}</TableCell>
                    <TableCell>{customer.user?.email}</TableCell>
                    <TableCell>{customer.user?.phone}</TableCell>
                    <TableCell>
                      <Typography color={customer.user?.isActive ? 'success.main' : 'text.secondary'} fontWeight="bold">
                        {customer.user?.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="info" onClick={() => handleViewOrders(customer)} title="Xem đơn hàng"><FaEye /></IconButton>
                      <IconButton color="primary" onClick={() => handleEdit(customer)} title="Sửa"><FaEdit /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(customer)} title="Xóa"><FaTrash /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialog sửa thông tin */}
        <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, customer: null })} maxWidth="xs" fullWidth>
          <DialogTitle>Sửa thông tin khách hàng</DialogTitle>
          <DialogContent>
            {editDialog.customer && (
              <>
                <TextField margin="dense" label="Họ tên" name="name" value={editDialog.customer.user?.name || ''} onChange={handleEditChange} fullWidth />
                <TextField margin="dense" label="Email" name="email" value={editDialog.customer.user?.email || ''} onChange={handleEditChange} fullWidth />
                <TextField margin="dense" label="Số điện thoại" name="phone" value={editDialog.customer.user?.phone || ''} onChange={handleEditChange} fullWidth />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, customer: null })}>Hủy</Button>
            <Button onClick={handleEditSave} variant="contained" color="success">Lưu</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CustomerAdmin;
