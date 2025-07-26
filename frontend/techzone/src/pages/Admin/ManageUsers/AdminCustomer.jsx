import React, { useState, useEffect } from 'react';
import {
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    CircularProgress,
    Alert,
    TablePagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid, // Import Grid
    Box // Import Box
} from '@mui/material';
import { FaUserPlus } from 'react-icons/fa';
import { AiOutlineEdit } from "react-icons/ai";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuRefreshCw } from 'react-icons/lu'; // Import icon Refresh
import { useNavigate } from 'react-router-dom';
import CustomerService from '../../../services/CustomerService';

const CustomerAdmin = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Gộp 3 bộ lọc thành 1
    const [addDialog, setAddDialog] = useState({ open: false, fields: { name: '', email: '', phone: '', password: '' } });
    const [editDialog, setEditDialog] = useState({ open: false, customer: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
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

    const filteredCustomers = customers.filter(c => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            (c.user?.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (c.user?.email || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (c.user?.phone || '').includes(lowerCaseSearchTerm)
        );
    });

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

            // Kiểm tra tính hợp lệ của input trước khi gửi
            const validationError = validateCustomerInput(editDialog.customer.user, { isAdd: false });
            if (validationError) {
                alert(validationError);
                setLoading(false);
                return;
            }

            await CustomerService.updateCustomer(editDialog.customer.user._id, editDialog.customer.user);
            // Cập nhật lại danh sách sau khi sửa
            const res = await CustomerService.getAllCustomers(); // Gọi lại getAllCustomers để đảm bảo dữ liệu mới nhất
            setCustomers(res);
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
                await CustomerService.deleteCustomer(customer._id); // Sử dụng deleteCustomer đã định nghĩa trong service
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
                    <Typography variant="h5" fontWeight="bold" style={{ color: '#328E6E' }}>
                        Quản lý khách hàng
                    </Typography>
                    <Button variant="contained" onClick={handleAddCustomer} startIcon={<FaUserPlus />}
                        style={{ backgroundColor: '#328E6E' }}>
                        Thêm khách hàng
                    </Button>
                </div>
                {/* Gộp 3 bộ lọc thành 1 và thêm Grid, Button Reset */}
                <Card sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{xs: 12, sm: 8, md: 10}} >
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
                                sx={{ minWidth: 100 }}
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
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table size="small" sx={{ minWidth: 650 }} aria-label="customer table">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Ngày tạo</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Họ tên</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Số điện thoại</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Trạng thái</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }} align="center">Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((customer) => (
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
                                    {filteredCustomers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">Không có khách hàng nào phù hợp.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={filteredCustomers.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 20]}
                        />
                    </Paper>
                )}

                {/* Dialog sửa thông tin */}
                <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, customer: null })} maxWidth="xs" fullWidth>
                    <DialogTitle style={{ color: '#328E6E', fontWeight: "bold" }}>Sửa thông tin khách hàng</DialogTitle>
                    <DialogContent>
                        {editDialog.customer && (
                            <>
                                <TextField margin="dense" label="Họ tên" name="name" value={editDialog.customer.user?.name || ''} onChange={handleEditChange} fullWidth variant="outlined" />
                                <TextField margin="dense" label="Số điện thoại" name="phone" value={editDialog.customer.user?.phone || ''} onChange={handleEditChange} fullWidth variant="outlined" />
                                <FormControl fullWidth margin="dense" variant="outlined">
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
                        <Button onClick={handleEditSave} variant="contained" color="success" style={{ backgroundColor: '#059669' }}>Lưu</Button>
                    </DialogActions>
                </Dialog>
                {/* Dialog thêm khách hàng */}
                <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, fields: {} })} maxWidth="xs" fullWidth>
                    <DialogTitle style={{ color: '#328E6E', fontWeight: "bold" }}>Thêm khách hàng mới</DialogTitle>
                    <DialogContent>
                        <TextField margin="dense" label="Họ tên" name="name" value={addDialog.fields.name} onChange={e => setAddDialog({ ...addDialog, fields: { ...addDialog.fields, name: e.target.value } })} fullWidth required variant="outlined" />
                        <TextField margin="dense" label="Email" name="email" value={addDialog.fields.email} onChange={e => setAddDialog({ ...addDialog, fields: { ...addDialog.fields, email: e.target.value } })} fullWidth required variant="outlined" />
                        <TextField margin="dense" label="Số điện thoại" name="phone" value={addDialog.fields.phone} onChange={e => setAddDialog({ ...addDialog, fields: { ...addDialog.fields, phone: e.target.value } })} fullWidth variant="outlined" />
                        <TextField margin="dense" label="Mật khẩu" name="password" type="password" value={addDialog.fields.password} onChange={e => setAddDialog({ ...addDialog, fields: { ...addDialog.fields, password: e.target.value } })} fullWidth required variant="outlined" />
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