import React, { useState, useEffect } from 'react';
import {
    Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, CircularProgress, Alert, Select,
    MenuItem, InputLabel, FormControl, TablePagination,
    Grid, // Import Grid
    Box // Import Box
} from '@mui/material';
import { FaUserPlus } from 'react-icons/fa';
import { AiOutlineEdit } from 'react-icons/ai';
import { FaRegTrashCan } from 'react-icons/fa6';
import { LuRefreshCw } from 'react-icons/lu'; // Import icon Refresh
import StaffService from '../../../services/StaffService';
import RoleService from '../../../services/RoleService';
import CustomTablePagination from '../../../components/CustomPagination';

const StaffAdmin = () => {
    const [staffs, setStaffs] = useState([]);
    const [roles, setRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Gộp 3 bộ lọc thành 1
    const [addDialog, setAddDialog] = useState({ open: false, fields: { name: '', email: '', phone: '', isActive: true, password: '', role: '' } }); // Đặt isActive mặc định là true
    const [editDialog, setEditDialog] = useState({ open: false, staff: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchStaffsAndRoles = async () => {
            setLoading(true);
            try {
                const [staffData, roleData] = await Promise.all([
                    StaffService.getAllStaffs(),
                    RoleService.getAllStaffRoles()
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Gộp filter thành một searchTerm
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleResetFilter = () => {
        setSearchTerm('');
    };

    const filteredStaffs = staffs.filter(s => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            (s.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (s.email || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (s.phone || '').includes(lowerCaseSearchTerm)
        );
    });

    const handleEdit = (staff) => {
        setEditDialog({
            open: true,
            staff: {
                ...staff,
                role: staff.role?._id || staff.role || '', // đảm bảo là role ID
                password: '', // mặc định rỗng để không hiển thị mật khẩu cũ
            },
        });
    };


    const handleEditChange = (e) => {
        setEditDialog({ ...editDialog, staff: { ...editDialog.staff, [e.target.name]: e.target.value } });
    };

    const validateStaffInput = ({ name, email, phone, password, role }, { isAdd = true } = {}) => {
        if (!name || !name.trim()) return 'Họ tên không được để trống.';

        if (!email || !email.trim()) return 'Email không được để trống.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Email không hợp lệ.';

        if (!phone || !phone.trim()) return 'Số điện thoại không được để trống.';
        const phoneRegex = /^\d{10,11}$/;
        if (!phoneRegex.test(phone)) return 'Số điện thoại không hợp lệ (10-11 chữ số).';

        if (isAdd) {
            if (!password || !password.trim()) return 'Mật khẩu không được để trống.';
            if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
        }
        
        if (!role) return 'Quyền không được để trống.';

        return null;
    };

    const handleEditSave = async () => {
        const updatedData = { ...editDialog.staff };

        const validationError = validateStaffInput(updatedData, { isAdd: false });
        if (validationError) {
            alert(validationError);
            return;
        }

        // Nếu password để trống, loại bỏ khỏi object gửi đi
        if (!updatedData.password || !updatedData.password.trim()) {
            delete updatedData.password;
        }

        try {
            setLoading(true);
            await StaffService.updateStaff(updatedData._id, updatedData);
            const updated = await StaffService.getAllStaffs();
            setStaffs(updated);
            setEditDialog({ open: false, staff: null });
            alert('Cập nhật nhân viên thành công!');
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
                alert('Xóa nhân viên thành công!');
            } catch (err) {
                console.error(err);
                alert('Xóa thất bại!');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAdd = async () => {
        const validationError = validateStaffInput(addDialog.fields, { isAdd: true });
        if (validationError) {
            alert(validationError);
            return;
        }

        try {
            setLoading(true);
            await StaffService.addStaff(addDialog.fields);
            const updated = await StaffService.getAllStaffs();
            setStaffs(updated);
            setAddDialog({ open: false, fields: { name: '', email: '', phone: '', isActive: true, password: '', role: '' } });
            alert('Thêm nhân viên thành công!');
        } catch (err) {
            console.error(err);
            alert('Thêm nhân viên thất bại!');
        } finally {
            setLoading(false);
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
                    <Typography variant="h5" fontWeight="bold" style={{ color: '#328E6E', fontWeight: "bold" }}>
                        Quản lý nhân viên
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<FaUserPlus />}
                        style={{ backgroundColor: '#328E6E' }}
                        onClick={() => setAddDialog({ open: true, fields: { name: '', email: '', phone: '', isActive: true, password: '', role: '' } })}
                    >
                        Thêm nhân viên
                    </Button>
                </div>

                <Card sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{xs: 12, sm: 8, md: 10}}>
                            <TextField
                                label="Tìm kiếm (Tên, Email, SĐT)"
                                name="searchTerm"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                size="small"
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid size={{xs: 12, sm: 4, md: 2}}>
                            <Button
                                startIcon={<LuRefreshCw />}
                                color="success"
                                variant="outlined"
                                onClick={handleResetFilter}
                                fullWidth
                                sx={{minWidth: 100}}
                            >
                                RESET
                            </Button>
                        </Grid>
                    </Grid>
                </Card>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress color="success" />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <div>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#E0F2F1' }}>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Họ tên</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>SĐT</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Quyền</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Trạng thái</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "1rem" }}>Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredStaffs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((s) => (
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
                                    {filteredStaffs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center">Không có nhân viên nào phù hợp.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <CustomTablePagination
                            count={filteredStaffs.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 20]}
                        />
                    </div>
                )}

                {/* Dialog thêm nhân viên */}
                <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, fields: {} })} maxWidth="xs" fullWidth>
                    <DialogTitle style={{ color: '#328E6E', fontWeight: "bold" }}>Thêm nhân viên</DialogTitle>
                    <DialogContent>
                        <TextField margin="dense" label="Họ tên" name="name" fullWidth value={addDialog.fields.name} onChange={handleAddChange} variant="outlined" required />
                        <TextField margin="dense" label="Email" name="email" fullWidth value={addDialog.fields.email} onChange={handleAddChange} variant="outlined" required />
                        <TextField margin="dense" label="SĐT" name="phone" fullWidth value={addDialog.fields.phone} onChange={handleAddChange} variant="outlined" required />
                        <TextField margin="dense" label="Mật khẩu" name="password" fullWidth type="password"
                            value={addDialog.fields.password || ''} onChange={handleAddChange} variant="outlined" required />
                        <FormControl fullWidth margin="dense" variant="outlined" required>
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
                         <FormControl fullWidth margin="dense" variant="outlined">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                name="isActive"
                                value={addDialog.fields.isActive ? 'true' : 'false'}
                                onChange={(e) =>
                                    setAddDialog({
                                        ...addDialog,
                                        fields: { ...addDialog.fields, isActive: e.target.value === 'true' },
                                    })
                                }
                                label="Trạng thái"
                            >
                                <MenuItem value="true">Active</MenuItem>
                                <MenuItem value="false">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddDialog({ open: false, fields: {} })}>Hủy</Button>
                        <Button onClick={handleAdd}
                            variant="contained"
                            style={{ backgroundColor: '#059669' }}
                        >
                            Lưu
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog sửa nhân viên */}
                <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, staff: null })} maxWidth="xs" fullWidth>
                    <DialogTitle style={{ color: '#328E6E', fontWeight: "bold" }}>Sửa thông tin nhân viên</DialogTitle>
                    <DialogContent>
                        {editDialog.staff && (
                            <>
                                <TextField margin="dense" label="Họ tên" name="name" fullWidth value={editDialog.staff.name} onChange={handleEditChange} variant="outlined" />
                                <TextField margin="dense" label="Email" name="email" fullWidth value={editDialog.staff.email} disabled variant="outlined" /> {/* Email thường không được sửa */}
                                <TextField margin="dense" label="SĐT" name="phone" fullWidth value={editDialog.staff.phone} onChange={handleEditChange} variant="outlined" />
                                <TextField margin="dense" label="Mật khẩu mới (để trống nếu không đổi)" name="password" fullWidth type="password"
                                    value={editDialog.staff.password || ''} onChange={handleEditChange} variant="outlined" />
                                <FormControl fullWidth margin="dense" variant="outlined">
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
                                <FormControl fullWidth margin="dense" variant="outlined">
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
                        <Button
                            onClick={handleEditSave}
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

export default StaffAdmin;