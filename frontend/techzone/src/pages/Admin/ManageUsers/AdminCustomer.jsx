import React, { useState, useEffect } from 'react';
import { Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Alert, TablePagination, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { FaUserPlus } from 'react-icons/fa';
import { AiOutlineEdit } from "react-icons/ai";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import CustomerService from '../../../services/CustomerService';

const CustomerAdmin = () => {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState({ name: '', email: '', phone: '' });
  const [addDialog, setAddDialog] = useState({ open: false, fields: { name: '', email: '', phone: '', password: '' } });
  const [editDialog, setEditDialog] = useState({ open: false, customer: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await CustomerService.getAllCustomers();
        setCustomers(data);
        console.log('Fetched customers:', data);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Không thể tải danh sách khách hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const validateCustomerInput = ({ name, email, phone, password }, { isAdd = true } = {}) => {
    if (!name || !name.trim()) return 'Họ tên không được để trống.';

    if (!email || !email.trim()) return 'Email không được để trống.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email không hợp lệ.';

    if (phone) {
      const phoneRegex = /^\d{10,11}$/;
      if (!phoneRegex.test(phone)) return 'Số điện thoại không hợp lệ.';
    }

    if (isAdd) {
      if (!password || !password.trim()) return 'Mật khẩu không được để trống.';
      if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    return null;
  };


  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredCustomers = customers.filter(c =>
    (c.user?.name || '').toLowerCase().includes(filter.name.toLowerCase()) &&
    (c.user?.email || '').toLowerCase().includes(filter.email.toLowerCase()) &&
    (c.user?.phone || '').includes(filter.phone)
  );

  const handleEdit = (customer) => {
    console.log('Editing customer:', customer);
    setEditDialog({ open: true, customer: { ...customer } });
  };

  const handleEditChange = (e) => {
    setEditDialog({ ...editDialog, customer: { ...editDialog.customer, user: { ...editDialog.customer.user, [e.target.name]: e.target.value } } });
  };

  const handleEditSave = async () => {
    try {
      setLoading(true);
      console.log('Saving edited customer:', editDialog.customer);

      await CustomerService.updateCustomer(editDialog.customer.user._id, editDialog.customer.user);
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
  const handleAddCustomer = () => {
    setAddDialog({ open: true, fields: { name: '', email: '', phone: '', password: '' } });
  };
  const handleAddCustomerSave = async () => {
    const validationError = validateCustomerInput(addDialog.fields); 
    if (validationError) {
      alert(validationError);
      return;
    }
    try {
      setLoading(true);
      console.log('Adding new customer:', addDialog.fields);
      await CustomerService.addCustomer(addDialog.fields);
      // Sau khi thêm thành công, reload danh sách
      const data = await CustomerService.getAllCustomers();
      setCustomers(data);
      setAddDialog({
        open: false, fields: {
          name: '', email: '', phone
            : '', password: ''
        }
      });
    } catch (err) {
      console.error('Error adding customer:', err);
      alert('Thêm khách hàng thất bại!');
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
          <Typography variant="h5" color="success.main" fontWeight="bold" style={{ color: '#328E6E' }}>
            Quản lý khách hàng
          </Typography>
          <Button variant="contained" onClick={handleAddCustomer} startIcon={<FaUserPlus />} style={{ backgroundColor: '#328E6E' }}>
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
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer component={Paper}>
              <Table size="small" sx={{ minWidth: 650 }} aria-label="customer table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell>{new Date(customer.user?.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{customer.user?.name}</TableCell>
                      <TableCell>{customer.user?.email}</TableCell>
                      <TableCell>{customer.user?.phone}</TableCell>
                      <TableCell>
                        <Typography color={customer.user?.isActive ? 'success.main' : 'text.secondary'} fontWeight="bold">
                          {customer.user?.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="warning" onClick={() => handleViewOrders(customer)} title="Xem đơn hàng"><IoEyeOutline /></IconButton>
                        <IconButton size="small" color="info" onClick={() => handleEdit(customer)} title="Sửa"><AiOutlineEdit /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(customer)} title="Xóa"><FaRegTrashCan /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Dialog sửa thông tin */}
        <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, customer: null })} maxWidth="xs" fullWidth>
          <DialogTitle>Sửa thông tin khách hàng</DialogTitle>
          <DialogContent>
            {editDialog.customer && (
              <>
                <TextField margin="dense" label="Họ tên" name="name" value={editDialog.customer.user?.name || ''} onChange={handleEditChange} fullWidth />
                <TextField margin="dense" label="Số điện thoại" name="phone" value={editDialog.customer.user?.phone || ''} onChange={handleEditChange} fullWidth />
                <FormControl fullWidth margin="dense">
                  <InputLabel id="status-label">Trạng thái</InputLabel>
                  <Select
                    labelId="status-label"
                    label="Trạng thái"
                    name="isActive"
                    value={editDialog.customer.user?.isActive ? 'true' : 'false'}
                    onChange={e =>
                      handleEditChange({
                        target: {
                          name: 'isActive',
                          value: e.target.value === 'true'
                        }
                      })
                    }
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
                
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, customer: null })}>Hủy</Button>
            <Button onClick={handleEditSave} variant="contained" color="success">Lưu</Button>
          </DialogActions>
        </Dialog>
        {/* Dialog thêm khách hàng */}
        <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, fields: {} })} maxWidth="xs" fullWidth>
          <DialogTitle>Thêm khách hàng mới</DialogTitle>
          <DialogContent>
            <TextField margin="dense" label="Họ tên" name="name" value={addDialog.fields.name} onChange={e => setAddDialog({ ...addDialog, fields: { ...addDialog.fields, name: e.target.value } })} fullWidth required />
            <TextField margin="dense" label="Email" name="email" value={addDialog.fields.email} onChange={e => setAddDialog({ ...addDialog, fields: { ...addDialog.fields, email: e.target.value } })} fullWidth required />
            <TextField margin="dense" label="Số điện thoại" name="phone" value={addDialog.fields.phone} onChange={e => setAddDialog({ ...addDialog, fields: { ...addDialog.fields, phone: e.target.value } })} fullWidth />
            <TextField margin="dense" label="Mật khẩu" name="password" type="password" value={addDialog.fields.password} onChange={e => setAddDialog({ ...addDialog, fields: { ...addDialog.fields, password: e.target.value } })} fullWidth required />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialog({ open: false, fields: {} })}>Hủy</Button>
            <Button
              onClick={handleAddCustomerSave}
              variant="contained"
              style={{ backgroundColor: '#059669' }}
            >
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CustomerAdmin;
