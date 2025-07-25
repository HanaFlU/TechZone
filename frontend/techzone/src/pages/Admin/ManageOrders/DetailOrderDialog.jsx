import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Grid
} from '@mui/material';
import {
  getPaymentMethodName,
  getPaymentStatusName
} from '../../../hooks/useOrderFormat';

const textColor = '#333';
const lightGray = '#f5f5f5';

const Info = ({ label, value, sx = {} }) => (
  <Typography variant="body2" sx={{ mb: 0.5, ...sx }}>
    <Typography variant="body2" component="span" color={textColor}>{label}:</Typography> {value}
  </Typography>
);

const DetailOrderDialog = ({
  open,
  onClose,
  selectedOrder,
  formatDateTime,
  getStatusDisplayName,
  getStatusChipColor
}) => {
  if (!selectedOrder) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" width="xl">
      <DialogContent sx={{ p: 4, pb: 0, backgroundColor: 'white', overflow: 'hidden' }}> 
        <Box sx={{ pb: 2 }}>
          <Grid container spacing={4} alignItems="start" justifyContent="space-between">
            {/* Chi tiết đơn hàng */}
            <Grid item>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#328E6E' }}>CHI TIẾT ĐƠN HÀNG</Typography>
                <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" sx={{ color: textColor, mr: 1, fontWeight: 'bold' }}>Order ID:</Typography>
                    <Typography variant="body2" sx={{ color: textColor }}>#{selectedOrder?.orderId}</Typography>
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" sx={{ color: textColor, mr: 1, fontWeight: 'bold' }}>Ngày đặt hàng:</Typography>
                    <Typography variant="body2" fontWeight="semi-bold" sx={{ color: textColor }}>{formatDateTime(selectedOrder.createdAt)}</Typography>
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" sx={{ mr: 1, color: textColor, fontWeight: 'bold' }}>Trạng thái hiện tại:</Typography>
                    <Chip
                    label={getStatusDisplayName(selectedOrder.status)}
                    color={getStatusChipColor(selectedOrder.status)}
                    sx={{ textTransform: 'none', height: '28px' }}
                    />
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" sx={{ mr: 1, color: textColor, fontWeight: 'bold' }}>Phương thức:</Typography>
                    <Typography variant="body2">{getPaymentMethodName(selectedOrder.paymentMethod)} - {getPaymentStatusName(selectedOrder.paymentStatus)}</Typography>
                </Box>
            </Grid>
            {/* Địa chỉ */}
            <Grid item sx={{ textAlign: 'left', mt: 5}}>
                <Typography sx={{ fontWeight: 'bold', color: textColor, mb: 1}}>Địa chỉ giao hàng</Typography>
                <Info label="Tên khách hàng" variant="body2" value={selectedOrder.customer?.user?.name || 'N/A'} />
                <Info label="Số điện thoại" variant="body2" value={selectedOrder.shippingAddress?.phone || 'N/A'} />
                <Info label="Địa chỉ" variant="body2" value={`${selectedOrder.shippingAddress?.street}, ${selectedOrder.shippingAddress?.ward}, ${selectedOrder.shippingAddress?.district}, ${selectedOrder.shippingAddress?.city}`} />
            </Grid>
            {/* Lịch sử */}
            <Grid item sx={{ textAlign: 'left', mt: 4}}>
                <Typography sx={{ fontWeight: 'bold', color: textColor, mb: 1}}>Lịch sử trạng thái</Typography>
                <Box>
                {selectedOrder.statusHistory?.length ? (
                    <Box>
                    {selectedOrder.statusHistory.map((history, idx) => (
                        <Box key={idx} display="flex" alignItems="center" mb={0.5}>
                        <Typography variant="body2" sx={{ mr: 1, minWidth: '100px', color: textColor }}>
                            {formatDateTime(history.timestamp)}:
                        </Typography>
                        <Chip label={getStatusDisplayName(history.status)} size="small" sx={{ fontWeight: 'bold' }} />
                        </Box>
                    ))}
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">Không có lịch sử trạng thái.</Typography>
                )}
                </Box>
            </Grid>
          </Grid>
        </Box>
        <Grid container spacing={2}>
            <Grid size={{ md: 8.8 }} fullWidth>
                {/* Bảng sản phẩm */}
                <Box sx={{ mb: 3 }}>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', maxHeight: '35vh', overflowY: 'auto' }}> {/* Adjusted maxHeight using vh */}
                    <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: textColor, width: '36%' }}>Sản phẩm</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: textColor, width: '20%' }}>Số lượng</TableCell>
                        <TableCell align="left" sx={{ fontWeight: 'bold', color: textColor, width: '22%' }}>Đơn giá</TableCell>
                        <TableCell align="left" sx={{ fontWeight: 'bold', color: textColor, width: '22%' }}>Thành tiền</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedOrder.items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>Không có sản phẩm.</TableCell>
                        </TableRow>
                        ) : (
                        selectedOrder.items.map((item) => (
                            <TableRow key={item._id || item.product?._id} hover>
                            <TableCell sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'}}>{item.product?.name || 'Tên sản phẩm'}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="left">{item.priceAtOrder.toLocaleString('vi-VN')} VND</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', color: textColor }}>{(item.quantity * item.priceAtOrder).toLocaleString('vi-VN')} VND</TableCell>
                            </TableRow>
                        ))
                        )}
                    </TableBody>
                    </Table>
                </TableContainer>
                </Box>
            </Grid>
            {/* Thông tin thanh toán */}
            <Grid size={{ md: 3.2 }}>
                
                <Box display="flex" alignItems="center" mt={1}>
                    <Typography sx={{ fontWeight: 'bold', color: textColor, mr: 1}}>Phí vận chuyển:</Typography>
                    <Typography >{selectedOrder.shippingFee ? `${selectedOrder.shippingFee.toLocaleString('vi-VN')} VND` : 'Free'}</Typography>
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                    <Typography sx={{ fontWeight: 'bold', color: textColor, mr: 1}}>Tổng tiền:</Typography>
                    <Typography sx={{color: "#328E6E", fontWeight: 'bold' }}>
                    {selectedOrder.totalAmount.toLocaleString('vi-VN')} VND
                    </Typography>
                </Box> 
            </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ borderTop: `1px solid ${lightGray}`, p: 1.5, justifyContent: 'flex-end' }}>
        <Button onClick={onClose} variant="contained" sx={{ backgroundColor: "#328E6E", '&:hover': { backgroundColor: '#124232' } }}>
          ĐÓNG
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailOrderDialog;