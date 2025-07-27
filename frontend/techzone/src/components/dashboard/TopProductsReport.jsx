// src/components/reports/TopProductsReport.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  FormControl, InputLabel, Select, MenuItem, TextField
} from '@mui/material';

import ProductService from '../../services/ProductService'; 

const TopProductsReport = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('revenue'); 
  const [limit, setLimit] = useState(10); 

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ProductService.getTopSellingProducts({ sortBy, limit });
        
        setProducts(response.data || []); 

      } catch (err) {
        setError('Không thể tải báo cáo sản phẩm hàng đầu.');
        console.error('Error fetching top products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [sortBy, limit]); 

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, minHeight: 300 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: '8px', boxShadow: 1 }}>
      <Typography variant="h5" sx={{ color: '#328E6E', fontWeight: 'bold', mb: 2 }}>
        Báo Cáo Sản Phẩm Hàng Đầu
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="sort-by-label">Sắp xếp theo</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            label="Sắp xếp theo"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="revenue">Doanh thu cao nhất</MenuItem>
            <MenuItem value="quantity">Bán chạy nhất</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Số lượng hiển thị"
          type="number"
          value={limit}
          onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value) || 1))}
          inputProps={{ min: 1 }}
          sx={{ width: 150 }}
        />
      </Box>

      {products.length === 0 ? (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Typography variant="body1" color="text.secondary">
            Không có dữ liệu sản phẩm để hiển thị.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 0, border: '1px solid', borderColor: 'grey.200' }}>
          <Table sx={{ minWidth: 650 }} aria-label="top products table">
            <TableHead>
              <TableRow sx={{ bgcolor: '#e0f2f1' }}>
                <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>Hình ảnh</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>Tên Sản phẩm</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>Danh mục</TableCell> {/* Cột mới */}
                <TableCell align="right" sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>Giá</TableCell> {/* Cột mới */}
                <TableCell align="right" sx={{ fontWeight: 'bold', textTransform: 'uppercase', py: 1.5 }}>
                  {sortBy === 'revenue' ? 'Tổng Doanh thu' : 'Số lượng đã bán'} {/* Thay đổi tiêu đề cột */}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, index) => (
                <TableRow
                  key={product.productId}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ width: 70, height: 70, overflow: 'hidden', borderRadius: '4px', border: '1px solid #eee' }}> {/* Tăng kích thước ảnh */}
                      <img 
                        src={product.productImage || '/default-product-image.png'} 
                        alt={product.productName} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.categoryName || 'N/A'}</TableCell> {/* Hiển thị tên danh mục */}
                  <TableCell align="right">
                    {product.productPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </TableCell>
                  <TableCell align="right">
                    {sortBy === 'revenue' 
                      ? product.totalRevenue?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                      : product.totalSoldQuantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TopProductsReport;