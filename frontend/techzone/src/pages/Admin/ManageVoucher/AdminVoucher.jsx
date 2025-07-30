import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, CardContent, Typography, Button, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem,
    TablePagination,
    Box,
    Chip,
    Grid,
    Switch
} from '@mui/material';

import { LuFilePlus2, LuRefreshCw } from "react-icons/lu";
import { IoEyeOutline } from 'react-icons/io5';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import VoucherService from '../../../services/VoucherService';
import { toast } from 'react-toastify';

const AdminVoucher = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filter, setFilter] = useState({
        searchTerm: '',
        status: '',
        discountType: '',
        startDate: '',
        endDate: '',
        limit: 10,
        page: 1,
    });
    const [totalVouchers, setTotalVouchers] = useState(0);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [voucherForm, setVoucherForm] = useState({
        description: '',
        code: '',
        discountType: 'PERCENT',
        discountValue: 0,
        maxDiscountAmount: '',
        minOrderAmount: 0,
        usageLimit: 1,
        startDate: '',
        endDate: '',
        isActive: true,
    });

    const primaryColor = '#328E6E';

    const fetchVouchers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await VoucherService.getAllVouchers(filter);
            if (response.success) {
                setVouchers(response.vouchers);
                setTotalVouchers(response.totalVouchers || response.vouchers.length);
            } else {
                setError(response.message || 'Không thể tải danh sách voucher.');
            }
        } catch (err) {
            console.error('Error fetching vouchers:', err);
            setError('Không thể tải danh sách voucher. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({
            ...prevFilter,
            [name]: value,
            page: 1,
        }));
    };

    const handleDateFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({
            ...prevFilter,
            [name]: value,
            page: 1,
        }));
    };

    const handleResetFilters = () => {
        setFilter({
            searchTerm: '',
            status: '',
            discountType: '',
            startDate: '',
            endDate: '',
            limit: 10,
            page: 1,
        });
    };

    const handleChangePage = (event, newPage) => {
        setFilter(prevFilter => ({ ...prevFilter, page: newPage + 1 }));
    };

    const handleChangeRowsPerPage = (event) => {
        setFilter(prevFilter => ({
            ...prevFilter,
            limit: parseInt(event.target.value, 10),
            page: 1,
        }));
    };

    // Modal handlers
    const handleOpenCreateModal = () => {
        setEditingVoucher(null);
        setVoucherForm({
            description: '',
            code: '',
            discountType: 'PERCENT',
            discountValue: 0,
            maxDiscountAmount: '',
            minOrderAmount: 0,
            usageLimit: 1,
            startDate: '',
            endDate: '',
            isActive: true,
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (voucher) => {
        setEditingVoucher(voucher);
        setVoucherForm({
            description: voucher.description,
            code: voucher.code,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            maxDiscountAmount: voucher.maxDiscountAmount || '',
            minOrderAmount: voucher.minOrderAmount,
            usageLimit: voucher.usageLimit,
            startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().split('T')[0] : '',
            endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().split('T')[0] : '',
            isActive: voucher.isActive,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVoucher(null);
        setVoucherForm({
            description: '',
            code: '',
            discountType: 'PERCENT',
            discountValue: 0,
            maxDiscountAmount: '',
            minOrderAmount: 0,
            usageLimit: 1,
            startDate: '',
            endDate: '',
            isActive: true,
        });
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setVoucherForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!voucherForm.description || !voucherForm.code || voucherForm.discountValue === undefined) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }

        try {
            const formData = {
                ...voucherForm,
                maxDiscountAmount: voucherForm.maxDiscountAmount ? Number(voucherForm.maxDiscountAmount) : null,
            };

            if (editingVoucher) {
                const response = await VoucherService.updateVoucher(editingVoucher._id, formData);
                if (response.success) {
                    console.log('Voucher đã được cập nhật thành công!');
                    toast.success('Cập nhật voucher thành công!');
                } else {
                    setError(response.message || 'Lỗi khi cập nhật voucher.');
                    toast.error('Lỗi khi cập nhật voucher.');
                    return;
                }
            } else {
                const response = await VoucherService.createVoucher(formData);
                if (response.success) {
                    console.log('Voucher đã được tạo thành công!');
                    toast.success('Tạo voucher thành công!');
                } else {
                    setError(response.message || 'Lỗi khi tạo voucher.');
                    toast.error('Lỗi khi tạo voucher.');
                    return;
                }
            }
            fetchVouchers();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving voucher:', err);
            setError('Lỗi khi lưu voucher.');
            toast.error('Lỗi khi lưu voucher.');
        }
    };

    const handleToggleActive = async (voucherId, currentStatus) => {
        try {
            const response = await VoucherService.updateVoucher(voucherId, { isActive: !currentStatus });
            if (response.success) {
                console.log('Trạng thái voucher đã được cập nhật!');
                setVouchers(prevVouchers =>
                    prevVouchers.map(voucher =>
                        voucher._id === voucherId ? { ...voucher, isActive: !currentStatus } : voucher
                    )
                );
                toast.success('Cập nhật trạng thái voucher thành công!');
            } else {
                setError(response.message || 'Lỗi khi cập nhật trạng thái.');
                toast.error('Lỗi khi cập nhật trạng thái voucher.');
            }
        } catch (err) {
            console.error('Error toggling voucher status:', err);
            toast.error('Lỗi khi cập nhật trạng thái voucher.');
            setError(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái voucher.');
        }
    };

    const handleDeleteVoucher = async (voucherId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
            try {
                const response = await VoucherService.deleteVoucher(voucherId);
                if (response.success) {
                    console.log('Voucher đã được xóa thành công!');
                    toast.success('Xóa voucher thành công!');
                    fetchVouchers();
                } else {
                    setError(response.message || 'Lỗi khi xóa voucher.');
                    toast.error('Lỗi khi xóa voucher.');
                }
            } catch (err) {
                console.error('Error deleting voucher:', err);
                setError('Lỗi khi xóa voucher.');
                setError(err.response?.data?.message || 'Lỗi khi xóa voucher.');
            }
        }
    };

    // Helper functions
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatDiscount = (voucher) => {
        if (voucher.discountType === 'PERCENT') {
            return `${voucher.discountValue}%`;
        } else if (voucher.discountType === 'FIXED_AMOUNT') {
            return `${voucher.discountValue.toLocaleString('vi-VN')} VND`;
        } else if (voucher.discountType === 'FREE_SHIPPING') {
            return 'Miễn phí vận chuyển';
        }
        return 'N/A';
    };

    const getStatusLabel = (voucher) => {
        const now = new Date();
        const startDate = new Date(voucher.startDate);
        const endDate = new Date(voucher.endDate);

        if (!voucher.isActive) return 'Không hoạt động';
        if (now < startDate) return 'Sắp diễn ra';
        if (now > endDate) return 'Đã hết hạn';
        if ((voucher.usedCount ?? 0) >= (voucher.usageLimit ?? 1)) return 'Hết lượt sử dụng';
        return 'Đang hoạt động';
    };

    const getStatusChipColor = (voucher) => {
        const status = getStatusLabel(voucher);
        switch (status) {
            case 'Đang hoạt động': return 'success';
            case 'Đã hết hạn': return 'error';
            case 'Sắp diễn ra': return 'info';
            case 'Không hoạt động': return 'default';
            case 'Hết lượt sử dụng': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Card elevation={3}>
            <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" style={{ color: primaryColor }}>
                        Quản lý Mã Giảm Giá
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<MdAdd />}
                        style={{ backgroundColor: primaryColor }}
                        onClick={handleOpenCreateModal}
                    >
                        Thêm mã giảm giá
                    </Button>
                </div>

                {/* Filters */}
                <Card sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" flexWrap="wrap" gap={2} my={2}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <TextField
                                    label="Tìm kiếm theo tên/mã"
                                    name="searchTerm"
                                    value={filter.searchTerm}
                                    onChange={handleFilterChange}
                                    size="small"
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Trạng thái</InputLabel>
                                    <Select
                                        name="status"
                                        value={filter.status}
                                        label="Trạng thái"
                                        onChange={handleFilterChange}
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        <MenuItem value="active">Đang hoạt động</MenuItem>
                                        <MenuItem value="inactive">Không hoạt động</MenuItem>
                                        <MenuItem value="expired">Đã hết hạn</MenuItem>
                                        <MenuItem value="upcoming">Sắp diễn ra</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Loại giảm giá</InputLabel>
                                    <Select
                                        name="discountType"
                                        value={filter.discountType}
                                        label="Loại giảm giá"
                                        onChange={handleFilterChange}
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        <MenuItem value="PERCENT">Phần trăm</MenuItem>
                                        <MenuItem value="FIXED_AMOUNT">Số tiền cố định</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <TextField
                                    label="Từ ngày"
                                    type="date"
                                    name="startDate"
                                    value={filter.startDate}
                                    onChange={handleDateFilterChange}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <TextField
                                    label="Đến ngày"
                                    type="date"
                                    name="endDate"
                                    value={filter.endDate}
                                    onChange={handleDateFilterChange}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<LuRefreshCw />}
                                    onClick={handleResetFilters}
                                    style={{ color: primaryColor, borderColor: primaryColor }}
                                >
                                    Reset
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Card>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress color="success" />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <Paper sx={{ width: '100%', overflowX: 'auto' }}>
                        <TableContainer component={Paper}>
                            <Table size="small" sx={{ minWidth: 800 }} aria-label="voucher table">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                                        <TableCell sx={{ fontSize: "1rem" }}>Mã voucher</TableCell>
                                        <TableCell sx={{ fontSize: "1rem" }}>Giảm giá</TableCell>
                                        <TableCell sx={{ fontSize: "1rem" }}>Ngày bắt đầu</TableCell>
                                        <TableCell sx={{ fontSize: "1rem" }}>Ngày kết thúc</TableCell>
                                        <TableCell sx={{ fontSize: "1rem" }} align="center">Trạng thái</TableCell>
                                        <TableCell sx={{ fontSize: "1rem" }} align="center">Hoạt động</TableCell>
                                        <TableCell sx={{ fontSize: "1rem"}} align="center">Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {vouchers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center">
                                                Không tìm thấy mã giảm giá nào.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        vouchers.map((voucher) => (
                                            <TableRow key={voucher._id}>
                                                <TableCell>{voucher.code}</TableCell>
                                                <TableCell>{formatDiscount(voucher)}</TableCell>
                                                <TableCell>{formatDate(voucher.startDate)}</TableCell>
                                                <TableCell>{formatDate(voucher.endDate)}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={getStatusLabel(voucher)}
                                                        color={getStatusChipColor(voucher)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Switch
                                                        checked={voucher.isActive}
                                                        onChange={() => handleToggleActive(voucher._id, voucher.isActive)}
                                                        color="success"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton size="small" color="warning" onClick={() => handleOpenEditModal(voucher)} title="Chỉnh sửa">
                                                        <MdEdit />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteVoucher(voucher._id)} title="Xóa">
                                                        <MdDelete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={totalVouchers}
                            page={filter.page - 1}
                            onPageChange={handleChangePage}
                            rowsPerPage={filter.limit}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 20]}
                        />
                    </Paper>
                )}

                {/* Modal for Add/Edit Voucher */}
                <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
                    <DialogTitle style={{ color: primaryColor }}>
                        {editingVoucher ? 'Chỉnh sửa Mã Giảm Giá' : 'Thêm Mã Giảm Giá Mới'}
                    </DialogTitle>
                    <DialogContent dividers sx={{ padding: '24px !important' }}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 3, 
                            width: '100%',
                            '& .MuiTextField-root': { 
                                width: '100%' 
                            },
                            '& .MuiFormControl-root': { 
                                width: '100%' 
                            }
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                flexDirection: { xs: 'column', sm: 'row' },
                                '& .MuiTextField-root': { 
                                    flex: 1,
                                    width: '100%'
                                }
                            }}>
                                <TextField
                                    label="Mã Voucher"
                                    name="code"
                                    value={voucherForm.code}
                                    onChange={handleFormChange}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Giới hạn lượt sử dụng"
                                    name="usageLimit"
                                    type="number"
                                    value={voucherForm.usageLimit}
                                    onChange={handleFormChange}
                                    fullWidth
                                />
                            </Box>
                            
                            <TextField
                                label="Mô tả chi tiết voucher"
                                name="description"
                                value={voucherForm.description}
                                onChange={handleFormChange}
                                fullWidth
                                required
                            />
                            
                            <FormControl fullWidth>
                                <InputLabel>Loại giảm giá</InputLabel>
                                <Select
                                    name="discountType"
                                    value={voucherForm.discountType}
                                    label="Loại giảm giá"
                                    onChange={handleFormChange}
                                >
                                    <MenuItem value="PERCENT">Phần trăm (%)</MenuItem>
                                    <MenuItem value="FIXED_AMOUNT">Số tiền cố định</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <TextField
                                label="Giá trị giảm giá"
                                name="discountValue"
                                type="number"
                                value={voucherForm.discountValue}
                                onChange={handleFormChange}
                                fullWidth
                                required
                            />
                            
                            {voucherForm.discountType === 'PERCENT' && (
                                <TextField
                                    label="Giảm tối đa (VND)"
                                    name="maxDiscountAmount"
                                    type="number"
                                    value={voucherForm.maxDiscountAmount}
                                    onChange={handleFormChange}
                                    fullWidth
                                />
                            )}
                            
                            <TextField
                                label="Đơn hàng tối thiểu (VND)"
                                name="minOrderAmount"
                                type="number"
                                value={voucherForm.minOrderAmount}
                                onChange={handleFormChange}
                                fullWidth
                            />
                            
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                flexDirection: { xs: 'column', sm: 'row' },
                                '& .MuiTextField-root': { 
                                    flex: 1,
                                    width: '100%'
                                }
                            }}>
                                <TextField
                                    label="Ngày bắt đầu"
                                    name="startDate"
                                    type="date"
                                    value={voucherForm.startDate}
                                    onChange={handleFormChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="Ngày kết thúc"
                                    name="endDate"
                                    type="date"
                                    value={voucherForm.endDate}
                                    onChange={handleFormChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>
                            
                            <Box display="flex" alignItems="center" sx={{ width: '100%' }}>
                                <Typography variant="body1" sx={{ mr: 2 }}>Hoạt động:</Typography>
                                <Switch
                                    name="isActive"
                                    checked={voucherForm.isActive}
                                    onChange={handleFormChange}
                                    color="success"
                                />
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ padding: 2 }}>
                        <Button onClick={handleCloseModal}>Hủy</Button>
                        <Button onClick={handleFormSubmit} variant="contained" style={{ backgroundColor: primaryColor }}>
                            {editingVoucher ? 'Cập nhật' : 'Thêm'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default AdminVoucher;