import React, { useState, useEffect, useCallback } from 'react';
import VoucherService from '../../../services/VoucherService';
import useNotification from '../../../hooks/useNotification';
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
    Switch // Import Switch component
} from '@mui/material';

import { LuFilePlus2, LuRefreshCw } from "react-icons/lu"; // Hoặc icon tương tự cho Export/Import/Reset
import { IoEyeOutline } from 'react-icons/io5'; // Có thể dùng cho hành động chi tiết nếu cần
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md'; // Icons cho hành động
import { TbFilter } from 'react-icons/tb'; // Icon cho Filter

const AdminVoucher = () => { // Đổi tên component cho phù hợp với AdminOrderList
    const { displayNotification } = useNotification();

    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filter, setFilter] = useState({
        searchTerm: '',
        status: 'all',
        page: 1,
        limit: 10,
    });
    const [totalVouchers, setTotalVouchers] = useState(0); // Để dùng cho pagination

    // State cho Modal/Form thêm/sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null); // null cho thêm mới, object cho chỉnh sửa

    // State cho voucher mới/đang chỉnh sửa
    const [voucherForm, setVoucherForm] = useState({
        campaignName: '',
        code: '',
        discountType: 'PERCENT', // 'PERCENT', 'FIXED_AMOUNT', 'FREE_SHIPPING'
        discountValue: 0,
        maxDiscountAmount: null,
        minOrderAmount: 0,
        usageLimit: 1,
        startDate: '',
        endDate: '',
        isActive: true, // published
    });

    const primaryColor = '#328E6E'; // Màu chủ đạo từ AdminOrderList

    const fetchVouchers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Cập nhật để truyền filter từ state
            const response = await VoucherService.getAllVouchers({
                searchTerm: filter.searchTerm,
                status: filter.status,
                page: filter.page,
                limit: filter.limit,
            });
            if (response.success) {
                setVouchers(response.vouchers);
                setTotalVouchers(response.totalVouchers); // Cập nhật tổng số lượng
            } else {
                setError(response.message || 'Lỗi khi tải danh sách voucher.');
            }
        } catch (err) {
            console.error('Error fetching vouchers:', err);
            setError('Không thể tải danh sách voucher.');
            displayNotification('Không thể tải danh sách voucher.', 'error');
        } finally {
            setLoading(false);
        }
    }, [filter, displayNotification]); // Thêm filter vào dependency array

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({
            ...prevFilter,
            [name]: value,
            page: 1, // Reset page khi thay đổi filter
        }));
    };

    const handleResetFilters = () => {
        setFilter({
            searchTerm: '',
            status: 'all',
            page: 1,
            limit: 10,
        });
    };

    // Phân trang
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

    // Xử lý mở/đóng modal và điền dữ liệu
    const handleOpenCreateModal = () => {
        setEditingVoucher(null);
        setVoucherForm({
            campaignName: '',
            code: '',
            discountType: 'PERCENT',
            discountValue: 0,
            maxDiscountAmount: null,
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
            campaignName: voucher.campaignName,
            code: voucher.code,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            maxDiscountAmount: voucher.maxDiscountAmount,
            minOrderAmount: voucher.minOrderAmount,
            usageLimit: voucher.usageLimit,
            startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().split('T')[0] : '', // Format YYYY-MM-DD
            endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().split('T')[0] : '',     // Format YYYY-MM-DD
            isActive: voucher.isActive,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVoucher(null);
        setVoucherForm({ // Reset form
            campaignName: '', code: '', discountType: 'PERCENT', discountValue: 0,
            maxDiscountAmount: null, minOrderAmount: 0, usageLimit: 1,
            startDate: '', endDate: '', isActive: true,
        });
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setVoucherForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Hàm xử lý thay đổi trạng thái isActive
    const handleToggleActive = async (voucherId, currentStatus) => {
        try {
            const response = await VoucherService.updateVoucher(voucherId, { isActive: !currentStatus });
            if (response.success) {
                displayNotification('Trạng thái voucher đã được cập nhật!', 'success');
                fetchVouchers(); // Tải lại danh sách
            } else {
                displayNotification(response.message || 'Lỗi khi cập nhật trạng thái.', 'error');
            }
        } catch (err) {
            console.error('Error toggling voucher status:', err);
            displayNotification(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái voucher.', 'error');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!voucherForm.campaignName || !voucherForm.code || voucherForm.discountValue === undefined) {
            displayNotification('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error');
            return;
        }

        try {
            if (editingVoucher) {
                // Cập nhật voucher
                const response = await VoucherService.updateVoucher(editingVoucher._id, voucherForm);
                if (response.success) {
                    displayNotification('Voucher đã được cập nhật thành công!', 'success');
                } else {
                    displayNotification(response.message || 'Lỗi khi cập nhật voucher.', 'error');
                }
            } else {
                // Tạo voucher mới
                const response = await VoucherService.createVoucher(voucherForm);
                if (response.success) {
                    displayNotification('Voucher đã được tạo thành công!', 'success');
                } else {
                    displayNotification(response.message || 'Lỗi khi tạo voucher.', 'error');
                }
            }
            fetchVouchers(); // Tải lại danh sách voucher
            handleCloseModal(); // Đóng modal
        } catch (err) {
            console.error('Error saving voucher:', err);
            displayNotification(err.response?.data?.message || 'Lỗi khi lưu voucher.', 'error');
        }
    };

    const handleDeleteVoucher = async (voucherId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
            try {
                const response = await VoucherService.deleteVoucher(voucherId);
                if (response.success) {
                    displayNotification('Voucher đã được xóa thành công!', 'success');
                    fetchVouchers(); // Tải lại danh sách voucher
                } else {
                    displayNotification(response.message || 'Lỗi khi xóa voucher.', 'error');
                }
            } catch (err) {
                console.error('Error deleting voucher:', err);
                displayNotification(err.response?.data?.message || 'Lỗi khi xóa voucher.', 'error');
            }
        }
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Helper function to format discount display
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
        if ((voucher.usedCount ?? 0) >= (voucher.usageLimit ?? 1)) return 'Hết lượt sử dụng'; // Đảm bảo an toàn
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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold" style={{ color: primaryColor }}>
                        Quản lý Mã Giảm Giá
                    </Typography>
                    <Box display="flex" gap={1}>
                        <Button
                            variant="outlined"
                            startIcon={<LuFilePlus2 />}
                            style={{ color: primaryColor, borderColor: primaryColor }}
                        >
                            Xuất
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<LuFilePlus2 />} // Có thể dùng icon khác cho Import
                            style={{ color: primaryColor, borderColor: primaryColor }}
                        >
                            Nhập
                        </Button>
                        <Button
                            variant="outlined"
                            // startIcon={<MdDelete />} // Icon cho Bulk Action
                            style={{ color: primaryColor, borderColor: primaryColor }}
                        >
                            Hành động hàng loạt
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<MdDelete />}
                            color="error"
                            // onClick={handleDeleteSelectedVouchers} // Thêm logic cho xóa hàng loạt
                        >
                            Xóa
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<MdAdd />}
                            style={{ backgroundColor: primaryColor }}
                            onClick={handleOpenCreateModal}
                        >
                            Thêm mã giảm giá
                        </Button>
                    </Box>
                </Box>

                {/* Filters */}
                <Card sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Tìm kiếm theo tên chiến dịch/mã"
                                name="searchTerm"
                                value={filter.searchTerm}
                                onChange={handleFilterChange}
                                size="small"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    name="status"
                                    value={filter.status}
                                    label="Trạng thái"
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                                    <MenuItem value="active">Đang hoạt động</MenuItem>
                                    <MenuItem value="expired">Đã hết hạn</MenuItem>
                                    {/* Có thể thêm các trạng thái khác nếu cần */}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                             <Button
                                variant="contained"
                                startIcon={<TbFilter />}
                                onClick={fetchVouchers} // Gọi lại fetchVouchers với filter mới
                                style={{ backgroundColor: primaryColor }}
                                fullWidth
                            >
                                Lọc
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Button
                                variant="outlined"
                                startIcon={<LuRefreshCw />}
                                onClick={handleResetFilters}
                                style={{ color: primaryColor, borderColor: primaryColor }}
                                fullWidth
                            >
                                Đặt lại bộ lọc
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
                            <Table size="small" sx={{ minWidth: 1000 }} aria-label="voucher table">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                                        <TableCell padding="checkbox">
                                            <input type="checkbox" className="form-checkbox h-4 w-4 text-emerald-600" />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>Tên chiến dịch</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>Mã</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>Giảm giá</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.9rem" }} align="center">Hiển thị</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>Ngày bắt đầu</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>Ngày kết thúc</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.9rem" }} align="center">Trạng thái</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.9rem" }} align="center">Hành động</TableCell>
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
                                                <TableCell padding="checkbox">
                                                    <input type="checkbox" className="form-checkbox h-4 w-4 text-emerald-600" />
                                                </TableCell>
                                                <TableCell>{voucher.campaignName}</TableCell>
                                                <TableCell>{voucher.code}</TableCell>
                                                <TableCell>{formatDiscount(voucher)}</TableCell>
                                                <TableCell align="center">
                                                    <Switch
                                                        checked={voucher.isActive}
                                                        onChange={() => handleToggleActive(voucher._id, voucher.isActive)}
                                                        color="success"
                                                        inputProps={{ 'aria-label': 'toggle voucher status' }}
                                                    />
                                                </TableCell>
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
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(voucher)} title="Chỉnh sửa">
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
                            page={filter.page - 1} // MUI pagination is 0-indexed
                            onPageChange={handleChangePage}
                            rowsPerPage={filter.limit}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 20]}
                        />
                    </Paper>
                )}

                {/* Modal for Add/Edit Voucher */}
                <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                    <DialogTitle style={{ color: primaryColor }}>
                        {editingVoucher ? 'Chỉnh sửa Mã Giảm Giá' : 'Thêm Mã Giảm Giá Mới'}
                    </DialogTitle>
                    <DialogContent dividers>
                        <form onSubmit={handleFormSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        margin="dense"
                                        label="Tên chiến dịch"
                                        name="campaignName"
                                        value={voucherForm.campaignName}
                                        onChange={handleFormChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        margin="dense"
                                        label="Mã Voucher"
                                        name="code"
                                        value={voucherForm.code}
                                        onChange={handleFormChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth margin="dense">
                                        <InputLabel>Loại giảm giá</InputLabel>
                                        <Select
                                            name="discountType"
                                            value={voucherForm.discountType}
                                            label="Loại giảm giá"
                                            onChange={handleFormChange}
                                        >
                                            <MenuItem value="PERCENT">Phần trăm (%)</MenuItem>
                                            <MenuItem value="FIXED_AMOUNT">Số tiền cố định</MenuItem>
                                            <MenuItem value="FREE_SHIPPING">Miễn phí vận chuyển</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        margin="dense"
                                        label="Giá trị giảm giá"
                                        name="discountValue"
                                        type="number"
                                        value={voucherForm.discountValue}
                                        onChange={handleFormChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                {voucherForm.discountType === 'PERCENT' && (
                                    <Grid item xs={12}>
                                        <TextField
                                            margin="dense"
                                            label="Giảm tối đa (VND)"
                                            name="maxDiscountAmount"
                                            type="number"
                                            value={voucherForm.maxDiscountAmount || ''}
                                            onChange={handleFormChange}
                                            fullWidth
                                        />
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <TextField
                                        margin="dense"
                                        label="Đơn hàng tối thiểu (VND)"
                                        name="minOrderAmount"
                                        type="number"
                                        value={voucherForm.minOrderAmount}
                                        onChange={handleFormChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        margin="dense"
                                        label="Giới hạn lượt sử dụng"
                                        name="usageLimit"
                                        type="number"
                                        value={voucherForm.usageLimit}
                                        onChange={handleFormChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="dense"
                                        label="Ngày bắt đầu"
                                        name="startDate"
                                        type="date"
                                        value={voucherForm.startDate}
                                        onChange={handleFormChange}
                                        fullWidth
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="dense"
                                        label="Ngày kết thúc"
                                        name="endDate"
                                        type="date"
                                        value={voucherForm.endDate}
                                        onChange={handleFormChange}
                                        fullWidth
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl margin="dense" display="flex" alignItems="center">
                                        <Typography variant="body1" component="span" sx={{ mr: 1 }}>Hoạt động</Typography>
                                        <Switch
                                            name="isActive"
                                            checked={voucherForm.isActive}
                                            onChange={handleFormChange}
                                            color="success"
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </form>
                    </DialogContent>
                    <DialogActions>
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