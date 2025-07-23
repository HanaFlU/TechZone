import React, { useState, useEffect } from 'react';
import {
  Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, CircularProgress, Alert, Select,
  MenuItem, InputLabel, FormControl
} from '@mui/material';
import { FaUserPlus } from 'react-icons/fa';
import { AiOutlineEdit } from 'react-icons/ai';
import { FaRegTrashCan } from 'react-icons/fa6';
import UserService from '../../services/UserService';
import StaffService from '../../services/StaffService';
import RoleService from '../../services/RoleService';

const StaffAdmin = () => {
  const [staffs, setStaffs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filter, setFilter] = useState({ name: '', email: '', phone: '' });
  const [addDialog, setAddDialog] = useState({ open: false, fields: { name: '', email: '', phone: '', isActive: '', password: '', role: '' } });
  const [editDialog, setEditDialog] = useState({ open: false, staff: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaffsAndRoles = async () => {
      setLoading(true);
      try {
        const [staffData, roleData] = await Promise.all([
          StaffService.getAllStaffs(),
          RoleService.getAllRoles()
        ]);
        setStaffs(staffData);
        setRoles(roleData);
      } catch (err) {
        setError('Không thể tải dữ liệu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffsAndRoles();
  }, []);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredStaffs = staffs.filter(s =>
    (s.name || '').toLowerCase().includes(filter.name.toLowerCase()) &&
    (s.email || '').toLowerCase().includes(filter.email.toLowerCase()) &&
    (s.phone || '').includes(filter.phone)
  );

  const handleEdit = (staff) => {
    setEditDialog({
      open: true,
      staff: {
        ...staff,
        role: staff.role?._id || staff.role || '', // đảm bảo là role ID
        password: '', // mặc định rỗng
      },
    });
  };


  const handleEditChange = (e) => {
    setEditDialog({ ...editDialog, staff: { ...editDialog.staff, [e.target.name]: e.target.value } });
  };

  const handleEditSave = async () => {
    const updatedData = { ...editDialog.staff };

    // Nếu password để trống, loại bỏ
    if (!updatedData.password || !updatedData.password.trim()) {
      delete updatedData.password;
    }

    try {
      setLoading(true);
      await StaffService.updateStaff(updatedData._id, updatedData);
      const updated = await StaffService.getAllStaffs();
      setStaffs(updated);
      setEditDialog({ open: false, staff: null });
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (staff) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      try {
        setLoading(true);
        await StaffService.deleteStaff(staff._id);
        setStaffs(prev => prev.filter(s => s._id !== staff._id));
      } catch (err) {
        console.error(err);
        alert('Xóa thất bại!');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAdd = async () => {
    const { name, email, phone, isActive, password, role } = addDialog.fields;
    if (!name.trim() || !email.trim() || !password.trim() || !role) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      await StaffService.addStaff(addDialog.fields);
      const updated = await StaffService.getAllStaffs();
      setStaffs(updated);
      setAddDialog({ open: false, fields: { name: '', email: '', phone: '', password: '', role: '' } });
    } catch (err) {
      alert('Thêm nhân viên thất bại!');
    }
  };
  const handleAddChange = (e) => {
    setAddDialog((prev) => ({
      ...prev,
      fields: { ...prev.fields, [e.target.name]: e.target.value },
    }));
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Typography variant="h5" fontWeight="bold" style={{ color: '#328E6E' }}>
            Quản lý nhân viên
          </Typography>
          <Button
            variant="contained"
            startIcon={<FaUserPlus />}
            style={{ backgroundColor: '#328E6E' }}
            onClick={() => setAddDialog({ open: true, fields: { name: '', email: '', phone: '', password: '', role: '' } })}
          >
            Thêm nhân viên
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <TextField label="Lọc theo tên" name="name" value={filter.name} onChange={handleFilterChange} size="small" />
          <TextField label="Lọc theo email" name="email" value={filter.email} onChange={handleFilterChange} size="small" />
          <TextField label="Lọc theo SĐT" name="phone" value={filter.phone} onChange={handleFilterChange} size="small" />
        </div>

        {loading ? (
          <CircularProgress color="primary" />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow style={{ backgroundColor: '#E0F2F1' }}>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>SĐT</TableCell>
                  <TableCell>Quyền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaffs.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>{s.role?.name || 'Chưa phân quyền'}</TableCell>
                    <TableCell>
                      <Typography color={s.isActive ? 'success.main' : 'text.secondary'} fontWeight="bold">
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="info" onClick={() => handleEdit(s)}><AiOutlineEdit /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(s)}><FaRegTrashCan /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialog thêm nhân viên */}
        <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, fields: {} })} maxWidth="xs" fullWidth>
          <DialogTitle>Thêm nhân viên</DialogTitle>
          <DialogContent>
            <TextField margin="dense" label="Họ tên" name="name" fullWidth value={addDialog.fields.name} onChange={handleEditChange} />
            <TextField margin="dense" label="SĐT" name="phone" fullWidth value={addDialog.fields.phone} onChange={handleEditChange} />
            <TextField margin="dense" label="Mật khẩu" name="password" fullWidth type="password"
              value={addDialog.fields.password || ''} onChange={handleEditChange} />
            <FormControl fullWidth margin="dense">
              <InputLabel>Quyền</InputLabel>
              <Select
                name="role"
                value={addDialog.fields.role}
                onChange={handleAddChange}
                label="Quyền"
              >
                {roles.map(role => (
                  <MenuItem key={role._id} value={role._id}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialog({ open: false, fields: {} })}>Hủy</Button>
            <Button onClick={handleAdd} variant="contained" color="success">Lưu</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog sửa nhân viên */}
        <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, staff: null })} maxWidth="xs" fullWidth>
          <DialogTitle>Sửa thông tin nhân viên</DialogTitle>
          <DialogContent>
            {editDialog.staff && (
              <>
                <TextField margin="dense" label="Họ tên" name="name" fullWidth value={editDialog.staff.name} onChange={handleEditChange} />
                <TextField margin="dense" label="SĐT" name="phone" fullWidth value={editDialog.staff.phone} onChange={handleEditChange} />
                <TextField margin="dense" label="Mật khẩu mới" name="password" fullWidth type="password"
                  value={editDialog.staff.password || ''} onChange={handleEditChange} />
                <FormControl fullWidth margin="dense">
                  <InputLabel>Quyền</InputLabel>
                  <Select
                    name="role"
                    value={editDialog.staff.role}
                    onChange={handleEditChange}
                    label="Quyền"
                  >
                    {roles.map(role => (
                      <MenuItem key={role._id} value={role._id}>{role.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="isActive"
                    value={editDialog.staff.isActive ? 'true' : 'false'}
                    onChange={(e) =>
                      setEditDialog({
                        ...editDialog,
                        staff: { ...editDialog.staff, isActive: e.target.value === 'true' },
                      })
                    }
                    label="Trạng thái"
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>

              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, staff: null })}>Hủy</Button>
            <Button onClick={handleEditSave} variant="contained" color="success">Lưu</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StaffAdmin;
