import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
    Card, CardContent, Typography, Button, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem,
    TablePagination,
    Box,
    Chip,
    Grid
} from '@mui/material';

import { LuFilePlus2, LuRefreshCw } from "react-icons/lu";
import { IoEyeOutline } from 'react-icons/io5';
import { PiPrinterFill } from "react-icons/pi";
import OrderService from '../../../services/OrderService';
import DetailOrderDialog from './DetailOrderDialog';
import PrintOrder from './PrintOrder';
import {
    formatDateTime,
    getStatusDisplayName,
    getStatusChipColor
} from '../../../hooks/useOrderFormat';
import CustomTablePagination from '../../../components/CustomPagination';
import { toast } from 'react-toastify';
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

    const primaryColor = '#328E6E';
    
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
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
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
        setFilter(prevFilter => ({ ...prevFilter, page: newPage + 1 }));
    };

    const handleChangeRowsPerPage = (event) => {
        setFilter(prevFilter => ({
            ...prevFilter,
            limit: parseInt(event.target.value, 10),
            page: 1,
        }));
    };
    const handleViewDetails = async (order) => {
        try {
            const response = await OrderService.getOrderById(order._id);
            setSelectedOrder(response.order);
            setDetailsDialogOpen(true);
        } catch (err) {
            console.error('Error fetching order details:', err);
            toast.error('Không thể tải chi tiết đơn hàng.');
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
            toast.success(`Cập nhật trạng thái đơn hàng thành công!`);
            handleCloseStatusUpdateDialog();
            fetchOrders();
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.');
            toast.error('Không thể cập nhật trạng thái đơn hàng.');
        }
    };
    const handleUpdateStatusInline = async (orderId, newStatus) => {
        try {
            await OrderService.updateOrderStatus(orderId, newStatus);
            console.log(`Order ${orderId} status updated to ${newStatus} successfully!`);
            toast.success(`Cập nhật trạng thái đơn hàng thành công!`);
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
            toast.error('Không thể cập nhật trạng thái đơn hàng.');
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
        setSelectedOrderToPrint(response.order);
    } catch (err) {
        console.error('Error fetching order details for printing:', err);
        setError('Không thể tải chi tiết đơn hàng để in.');
        toast.error('Không thể tải chi tiết đơn hàng để in.');
    }
};

useEffect(() => {
    if (selectedOrderToPrint) {
        handlePrint();
        setSelectedOrderToPrint(null);
    }
}, [selectedOrderToPrint, handlePrint]);

    return (
        <Card elevation={3}>
            <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant="h5" fontWeight="bold" style={{ color: primaryColor }}>
                        Quản lý đơn hàng
                    </Typography>
                </div>

                {/* Filters */}
                <Card sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" flexWrap="wrap" gap={2} my={2}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                                <TextField
                                    label="Search by Customer / Email"
                                    name="customerNameOrEmail"
                                    value={filter.customerNameOrEmail}
                                    onChange={handleFilterChange}
                                    size="small"
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<LuRefreshCw/>}
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
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer component={Paper}>
                            <Table size="small" sx={{ minWidth: 800 }} aria-label="order table">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                                        <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}}>Ngày đặt hàng</TableCell>
                                        <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}}>Khách hàng</TableCell>
                                        <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}}>Thanh toán</TableCell>
                                        <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}} align="left">Tổng tiền</TableCell>
                                        <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}} align="center">Trạng thái</TableCell>
                                        <TableCell sx={{fontWeigth: "bold", fontSize: "1rem", pl: 4 }} align="center">Hành động</TableCell>
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
                                                <TableCell align="left">{order.totalAmount.toLocaleString('vi-VN')} VND</TableCell>
                                                <TableCell align='center'>
                                                    <FormControl variant="outlined" size="small" sx={{  alignItems: "center" }}>
                                                    <Select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateStatusInline(order._id, e.target.value)}
                                                        displayEmpty
                                                        renderValue={(selectedStatus) => (
                                                            <Chip
                                                                label={getStatusDisplayName(selectedStatus)}
                                                                color={getStatusChipColor(selectedStatus)}
                                                                sx={{
                                                                cursor: 'pointer',
                                                                width: '140px',
                                                                justifyContent: 'center',
                                                                }}
                                                            />
                                                        )}
                                                        sx={{
                                                        '.MuiSelect-select': {
                                                            padding: '0 !important',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        },
                                                        '.MuiOutlinedInput-notchedOutline': {
                                                            border: 'none',
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            border: 'none',
                                                        },
                                                        '.MuiSelect-icon': {
                                                            color: 'rgba(0, 0, 0, 0.54)',
                                                            right: '2px',
                                                        },
                                                        width: '140px',
                                                        }}
                                                    >
                                                    {availableStatuses.map((statusOption) => (
                                                        <MenuItem key={statusOption} value={statusOption}>
                                                            {getStatusDisplayName(statusOption)}
                                                        </MenuItem>
                                                    ))}
                                                    </Select>
                                                    </FormControl>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton size="small" color="warning" onClick={() => handleViewDetails(order)} title="Xem chi tiết">
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
                        <CustomTablePagination
                            count={totalOrders}
                            page={filter.page - 1}
                            onPageChange={handleChangePage}
                            rowsPerPage={filter.limit}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 20]}
                        />
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
