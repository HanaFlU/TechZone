import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import OrderService from '../../../services/OrderService';
import { IoEyeOutline } from 'react-icons/io5';
import { PiPrinterFill } from "react-icons/pi";

import {
    formatDateTime,
    formatCurrency,
    getStatusDisplayName,
    getStatusChipColor,
    getPaymentMethodName,
} from '../../../hooks/useOrderFormat';

import DetailOrderDialog from '../ManageOrders/DetailOrderDialog';

const AdminCustomerOrderList = () => {
    const { customerId } = useParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [filter, setFilter] = useState({
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

    const componentRef = useRef();
    const [selectedOrderToPrint, setSelectedOrderToPrint] = useState(null);

    const primaryColor = '#328E6E';

    // Fetch thông tin khách hàng và đơn hàng
    const fetchCustomerAndOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch thông tin khách hàng
            const customerRes = await OrderService.api.get(`/customer/${customerId}`);
            setCustomer(customerRes.data.customer);
            const queryParams = new URLSearchParams({
                ...filter,
                page: filter.page.toString(),
                limit: filter.limit.toString(),
                startDate: filter.startDate,
                endDate: filter.endDate,
                status: filter.status,
                method: filter.method,
            }).toString();

            const ordersRes = await OrderService.api.get(`/customer/${customerId}?${queryParams}`);
            setOrders(ordersRes.data.orders || []);
            setTotalOrders(ordersRes.data.orders?.length || 0);

        } catch (err) {
            console.error('Lỗi khi tải thông tin khách hàng hoặc đơn hàng:', err);
            setError(err.response?.data?.message || "Không thể tải thông tin khách hàng hoặc danh sách đơn hàng.");
        } finally {
            setLoading(false);
        }
    }, [customerId, filter]);

    useEffect(() => {
        if (customerId) {
            fetchCustomerAndOrders();
        }
    }, [customerId, fetchCustomerAndOrders]);
    const handleChangePage = (newPage) => {
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
    const availableStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    // Chức năng in
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Hoa_don_${selectedOrderToPrint?.orderId || 'error'}`,
        pageStyle: `@page { size: A4; margin: 0; } body { margin: 0; }`
    });

    const triggerPrint = async (order) => {
        try {
            const response = await OrderService.api.get(`/orders/${order._id}`);
            setSelectedOrderToPrint(response.data.order);
        } catch (err) {
            console.error('Error fetching order details for printing:', err);
            setError('Không thể tải chi tiết đơn hàng để in.');
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16}}>
            <Typography variant="h5" fontWeight="bold" style={{ color: primaryColor }}>
              Đơn hàng của {customer ? customer.name : 'Khách hàng'}
            </Typography>
          </div>

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
                                    <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}} align="center">Tổng tiền</TableCell>
                                    <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}} align="center">Trạng thái</TableCell>
                                    <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}} align="left" sx={{ pl: 4 }}>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Không tìm thấy đơn hàng của khách hàng {customer ? customer.name : 'Khách hàng'}.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order) => (
                                        <TableRow key={order._id}>
                                            <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                                            <TableCell>{customer.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                {order.paymentMethod === 'COD' ? 'COD' :
                                                  order.paymentMethod === 'CREDIT_CARD' ? 'Credit Card' : 'E-Wallet'}
                                            </TableCell>
                                            <TableCell align="right">{order.totalAmount.toLocaleString('vi-VN')} VND</TableCell>
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
                    <TablePagination
                        component="div"
                        count={totalOrders}
                        page={filter.page - 1}
                        onPageChange={handleChangePage}
                        rowsPerPage={filter.limit}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 20]}
                    />
                </Paper>
            )}
            {/* Order Details Dialog (dùng Tailwind Modal nếu muốn, hoặc giữ lại Material-UI Dialog) */}
            <DetailOrderDialog
                open={detailsDialogOpen}
                onClose={handleCloseDetailsDialog}
                selectedOrder={selectedOrder}
                formatDateTime={formatDateTime}
                getStatusDisplayName={getStatusDisplayName}
                getStatusChipColor={getStatusChipColor}
                formatCurrency={formatCurrency} // Pass formatCurrency
                getPaymentMethodName={getPaymentMethodName} // Pass getPaymentMethodName
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

export default AdminCustomerOrderList;