import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Select, MenuItem,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { FaMedal } from 'react-icons/fa';

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

  const renderRank = (index) => {
    switch (index) {
      case 0:
        return <FaMedal size={20} color="#FFD700" style={{ verticalAlign: 'middle', marginRight: '2px' }} />; // Giảm size medal
      case 1:
        return <FaMedal size={20} color="#C0C0C0" style={{ verticalAlign: 'middle', marginRight: '2px' }} />; // Giảm size medal
      case 2:
        return <FaMedal size={20} color="#CD7F32" style={{ verticalAlign: 'middle', marginRight: '2px' }} />; // Giảm size medal
      default:
        return (
          <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'text.secondary' }}> {/* Giảm font size */}
            {index + 1}
          </Typography>
        );
    }
  };

  const handleSortByChange = (event, newSortBy) => {
    if (newSortBy !== null) {
      setSortBy(newSortBy);
    }
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value));
  };

  const commonPaperSx = {
    p: 3,
    minHeight: 450,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    bgcolor: '#fcfcfc',
    borderRadius: '8px',
    boxShadow: 3,
    fontFamily: 'Roboto, sans-serif',
  };

  if (loading) {
    return (
      <Paper sx={commonPaperSx}>
        <CircularProgress color="success" />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Đang tải dữ liệu...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={commonPaperSx}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ ...commonPaperSx, justifyContent: 'flex-start', alignItems: 'stretch' }}>
      <Typography
        variant="h5"
        sx={{
          color: '#328E6E',
          fontWeight: 'bold',
          mb: 3,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        Sản Phẩm Hàng Đầu
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3, gap: 1.5 }}>
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          onChange={handleSortByChange}
          sx={{
            height: 36,
            '& .MuiToggleButton-root': {
              borderColor: '#74B39D',
              color: '#328E6E',
              textTransform: 'none',
              fontWeight: 'medium',
              fontSize: '0.8rem', 
              px: 1.5,
              py: 0.5,
              '&.Mui-selected': {
                bgcolor: '#328E6E',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: '#287a5a',
                },
              },
              '&:not(.Mui-selected):hover': {
                bgcolor: '#e8f5e9',
              },
            },
          }}
        >
          <ToggleButton value="revenue">Doanh thu cao nhất</ToggleButton>
          <ToggleButton value="quantity">Bán chạy nhất</ToggleButton>
        </ToggleButtonGroup>

        <Select
          value={limit}
          onChange={handleLimitChange}
          disableUnderline
          variant="standard"
          sx={{
            minWidth: 50,
            height: 36,
            textAlign: 'center',
            bgcolor: '#e8f5e9',
            borderRadius: '4px',
            px: 0.5,
            '& .MuiSelect-select': {
              py: 0.5, 
              px: 0.5,
              lineHeight: 'normal',
              fontWeight: 'medium',
              color: '#328E6E',
              fontSize: '0.8rem', 
            },
            '& .MuiSvgIcon-root': {
              color: '#328E6E',
              fontSize: '1.1rem',
            },
            '&:before': { borderBottom: 'none !important' },
            '&:after': { borderBottom: 'none !important' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent !important' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent !important' },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#f5f5f5',
                '& .MuiMenuItem-root': {
                  color: '#333',
                  fontSize: '0.8rem', 
                  '&:hover': {
                    bgcolor: '#e0f7fa',
                  },
                  '&.Mui-selected': {
                    bgcolor: '#d0f0f4',
                    color: '#328E6E',
                  }
                }
              }
            }
          }}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
      </Box>

      {products.length === 0 ? (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 150 }}>
          <Typography variant="body1" color="text.secondary">
            Không có dữ liệu sản phẩm để hiển thị.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 4, borderRadius: '8px', overflowX: 'auto' }}> 
          <Table aria-label="top products table">
            <TableHead>
              <TableRow sx={{ bgcolor: '#e0f7fa' }}>
                <TableCell sx={{
                  fontWeight: 'bold',
                  fontSize: '0.8rem', 
                  color: '#263238',
                  py: 1.2, 
                  textAlign: 'center'
                }}>Hạng</TableCell>
                <TableCell sx={{
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  color: '#263238',
                  py: 1.2
                }}>Hình ảnh</TableCell>
                <TableCell sx={{
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  color: '#263238',
                  py: 1.2
                }}>Tên Sản phẩm</TableCell>
                <TableCell sx={{
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  color: '#263238',
                  py: 1.2
                }}>Danh mục</TableCell>
                <TableCell align="right" sx={{
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  color: '#263238',
                  py: 1.2
                }}>Giá</TableCell>
                <TableCell align="right" sx={{
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  color: '#263238',
                  py: 1.2
                }}>
                  {sortBy === 'revenue' ? 'Tổng Doanh thu' : 'Số lượng đã bán'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, index) => (
                <TableRow
                  key={product.productId}
                  sx={{
                    bgcolor: '#ffffff',
                    '&:nth-of-type(odd)': {
                      bgcolor: '#fdfdfd',
                    },
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                      cursor: 'default'
                    },
                  }}
                >
                  <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', py: 0.8 }}> 
                    {renderRank(index)}
                  </TableCell>
                  <TableCell sx={{ py: 0.8 }}>
                    <Box sx={{ width: 50, height: 50, overflow: 'hidden', borderRadius: '4px', border: '1px solid #eee' }}>
                      <img
                        src={product.productImage || '/default-product-image.png'}
                        alt={product.productName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#333333', py: 0.8 }}> 
                    {product.productName}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#555555', py: 0.8 }}> 
                    {product.categoryName || 'Chưa phân loại'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.8rem', color: '#333333', py: 0.8 }}>
                    {product.productPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 'medium', color: '#333333', py: 0.8 }}>
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
    </Paper>
  );
};

export default TopProductsReport;