import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
    Card, CardContent, Typography, Button, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem,
    Pagination,
    Box,
    Chip,
    Grid
} from '@mui/material';

import { LuFilePlus2 } from "react-icons/lu";
import { IoEyeOutline } from 'react-icons/io5';
import { PiPrinterFill } from "react-icons/pi";
import OrderService from '../../../services/OrderService';
import DetailOrderDialog from './DetailOrderDialog';
import PrintOrder from './PrintOrder';
const AdminOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({
        customerNameOrEmail: '',
        status: '',
        method: '',
        startDate: '',
        endDate: '',
        limit: 10,
        page: 1,
    });
    const [totalOrders, setTotalOrders] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
    const [currentUpdateStatus, setCurrentUpdateStatus] = useState('');

    const primaryColor = '#328E6E'; // Main green color
    
    const componentRef = useRef();
    const [selectedOrderToPrint, setSelectedOrderToPrint] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await OrderService.getAllOrders(filter);
            setOrders(response.orders);
            setTotalOrders(response.totalOrders);
        } catch (err) {
            console.error('Error fetching order list:', err);
            setError('Could not load order list. Please try again.');
            console.error('Error loading orders!'); // Thay thế toast.error
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

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
            customerNameOrEmail: '',
            status: '',
            method: '',
            startDate: '',
            endDate: '',
            limit: 10,
            page: 1,
        });
    };

    const handleChangePage = (event, newPage) => {
        setFilter(prevFilter => ({ ...prevFilter, page: newPage }));
    };

    const handleViewDetails = async (order) => {
        try {
            const response = await OrderService.getOrderById(order._id);
            setSelectedOrder(response.order);
            setDetailsDialogOpen(true);
        } catch (err) {
            console.error('Error fetching order details:', err);
            console.error('Could not load order details.');
        }
    };

    const handleCloseDetailsDialog = () => {
        setDetailsDialogOpen(false);
        setSelectedOrder(null);
    };



    const handleCloseStatusUpdateDialog = () => {
        setStatusUpdateDialogOpen(false);
        setSelectedOrder(null);
        setCurrentUpdateStatus('');
    };

    const handleStatusUpdate = async () => {
        if (!selectedOrder || !currentUpdateStatus) return;

        try {
            await OrderService.updateOrderStatus(selectedOrder._id, currentUpdateStatus);
            console.log(`Order ${selectedOrder.orderId} status updated to ${currentUpdateStatus} successfully!`);
            handleCloseStatusUpdateDialog();
            fetchOrders();
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Could not update order status. Please try again.');
        }
    };
    const handleUpdateStatusInline = async (orderId, newStatus) => {
        try {
            await OrderService.updateOrderStatus(orderId, newStatus);
            console.log(`Order ${orderId} status updated to ${newStatus} successfully!`);
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
        }
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(',', '');
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'CONFIRMED':
                return 'info';
            case 'SHIPPED':
                return 'primary';
            case 'DELIVERED':
                return 'success';
            case 'CANCELLED':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusDisplayName = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ xác nhận';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'SHIPPED': return 'Đang giao hàng';
            case 'DELIVERED': return 'Đã giao hàng';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };
    const availableStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    
const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Hóa_don_${selectedOrderToPrint?.orderId || 'error'}`, // Dùng selectedOrderToPrint
    pageStyle: `@page { size: A4; margin: 0; } body { margin: 0; }`
});

// Hàm này sẽ chỉ thiết lập dữ liệu cho hóa đơn
const triggerPrint = async (order) => {
    try {
        const response = await OrderService.getOrderById(order._id);
        setSelectedOrderToPrint(response.order); // Cập nhật state mới
        // KHÔNG gọi handlePrint ở đây nữa
    } catch (err) {
        console.error('Error fetching order details for printing:', err);
        setError('Không thể tải chi tiết đơn hàng để in.');
    }
};

// Sử dụng useEffect để theo dõi selectedOrderToPrint và kích hoạt in khi nó thay đổi
useEffect(() => {
    if (selectedOrderToPrint) {
        handlePrint();
        setSelectedOrderToPrint(null); // Đặt lại sau khi in để tránh in lại không cần thiết
    }
}, [selectedOrderToPrint, handlePrint]); // Thêm handlePrint vào dependency array


    return (
        <Card elevation={3}>
            <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant="h5" fontWeight="bold" style={{ color: primaryColor }}>
                        Quản lý đơn hàng
                    </Typography>
                </div>

                {/* Filters */}
                <Box display="flex" flexWrap="wrap" gap={2} my={2}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6, md: 6 }}>
                            <TextField
                                label="Search by Customer / Email"
                                name="customerNameOrEmail"
                                value={filter.customerNameOrEmail}
                                onChange={handleFilterChange}
                                size="small"
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={filter.status}
                                    label="Status"
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                                    <MenuItem value="SHIPPED">Shipped</MenuItem>
                                    <MenuItem value="DELIVERED">Delivered</MenuItem>
                                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Method</InputLabel>
                                <Select
                                    name="method"
                                    value={filter.method}
                                    label="Method"
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="COD">COD</MenuItem>
                                    <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                                    <MenuItem value="E_WALLET">E-Wallet</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <TextField
                                label="From Date"
                                type="date"
                                name="startDate"
                                value={filter.startDate}
                                onChange={handleDateFilterChange}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <TextField
                                label="To Date"
                                type="date"
                                name="endDate"
                                value={filter.endDate}
                                onChange={handleDateFilterChange}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 6 }}>
                            <Button variant="outlined" onClick={handleResetFilters} style={{ color: primaryColor, borderColor: primaryColor }}>
                                Reset
                            </Button>
                        </Grid>
                    </Grid>  
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress color="success" />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer component={Paper}>
                            <Table size="small" sx={{ minWidth: 800 }} aria-label="order table">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                                        <TableCell>Ngày đặt hàng</TableCell>
                                        <TableCell>Khách hàng</TableCell>
                                        <TableCell>Thanh toán</TableCell>
                                        <TableCell align="center">Tổng tiền</TableCell>
                                        <TableCell align="center">Trạng thái</TableCell>
                                        <TableCell align="left" sx={{ pl: 4 }}>Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                Không tìm thấy đơn hàng trong bộ lọc.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.map((order) => (
                                            <TableRow key={order._id}>
                                                <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                                                <TableCell>{order.customer?.user?.name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {order.paymentMethod === 'COD' ? 'COD' :
                                                     order.paymentMethod === 'CREDIT_CARD' ? 'Credit Card' : 'E-Wallet'}
                                                </TableCell>
                                                <TableCell align="right">{order.totalAmount.toLocaleString('vi-VN')} VND</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={getStatusDisplayName(order.status)}
                                                        color={getStatusChipColor(order.status)}
                                                        sx={{ cursor: 'default', minWidth: '100px' }}
                                                        
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <FormControl variant="outlined" size="small" sx={{  alignItems: "center" }}>
                                                        <Select
                                                            value={order.status}
                                                            onChange={(e) => handleUpdateStatusInline(order._id, e.target.value)}
                                                            displayEmpty
                                                            sx={{
                                                            width: '160px',
                                                            display: 'flex',
                                                            textAlign: 'start'
                                                            }}
                                                        >
                                                            {availableStatuses.map((statusOption) => (
                                                                <MenuItem key={statusOption} value={statusOption}>
                                                                    {getStatusDisplayName(statusOption)}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    {/* Các Icon khác bên cạnh Select */}
                                                    <IconButton sx={{ ml: 2 }} size="small" color="warning" onClick={() => handleViewDetails(order)} title="Xem chi tiết">
                                                        <IoEyeOutline />
                                                    </IconButton>
                                                    <IconButton size="small" color="info" onClick={() => triggerPrint(order)} title="In hóa đơn">
                                                        <PiPrinterFill />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {totalOrders > filter.limit && (
                            <Box display="flex" justifyContent="center" my={2}>
                                <Pagination
                                    count={Math.ceil(totalOrders / filter.limit)}
                                    page={filter.page}
                                    onChange={handleChangePage}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </Paper>
                )}

                {/* Order Details Dialog */}
                <DetailOrderDialog
                    open={detailsDialogOpen}
                    onClose={handleCloseDetailsDialog}
                    selectedOrder={selectedOrder}
                    formatDateTime={formatDateTime}
                    getStatusDisplayName={getStatusDisplayName}
                    getStatusChipColor={getStatusChipColor}
                />

                {/* Order Status Update Dialog */}
                <Dialog open={statusUpdateDialogOpen} onClose={handleCloseStatusUpdateDialog} maxWidth="xs" fullWidth>
                    <DialogTitle style={{ color: primaryColor }}>Update Order Status #{selectedOrder?.orderId}</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="status-update-label">New Status</InputLabel>
                            <Select
                                labelId="status-update-label"
                                label="New Status"
                                value={currentUpdateStatus}
                                onChange={(e) => setCurrentUpdateStatus(e.target.value)}
                            >
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                                <MenuItem value="SHIPPED">Shipped</MenuItem>
                                <MenuItem value="DELIVERED">Delivered</MenuItem>
                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseStatusUpdateDialog}>Cancel</Button>
                        <Button onClick={handleStatusUpdate} variant="contained" style={{ backgroundColor: primaryColor }}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

            </CardContent>
        </Card>
    );
};

export default AdminOrderList;
