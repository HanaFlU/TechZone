import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  CircularProgress, Select, MenuItem, InputLabel, FormControl,
  Box,
  Grid,
  TablePagination,
  TableSortLabel,
  Checkbox, 
} from '@mui/material';
import { FaPlus } from 'react-icons/fa';
import { AiOutlineEdit } from "react-icons/ai";
import { FaRegTrashCan } from "react-icons/fa6";
import { RiCloseLargeLine, RiImageAddLine } from "react-icons/ri";
import { LuRefreshCw } from "react-icons/lu";


import ProductService from '../../../services/ProductService';
import CategoryService from '../../../services/CategoryService';
import UploadService from '../../../services/UploadService';
import CategoryTreeSelect from '../../../components/treeView/categoryTreeSelect';
import { Editor } from '@tinymce/tinymce-react';
import removeDiacritics from '../../../utils/removeDiacritics';
import CustomTablePagination from '../../../components/CustomPagination';

const ProductManager = () => {
  const [products, setProducts] = useState([]); // Ensure products is initialized as an empty array
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [sort, setSort] = useState({
    field: '',
    order: '',
  });

  // State for bulk actions
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [openBulkActionDialog, setOpenBulkActionDialog] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newStatus, setNewStatus] = useState('');


  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    images: [],
    specs: []
  });

  useEffect(() => {
    fetchProducts();
  }, [sort]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await ProductService.adminGetAllProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("Lỗi khi fetch sản phẩm:", err);
      setProducts([]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getCategories();
      setCategories(res || []);
    } catch (err) {
      console.error("Lỗi khi fetch danh mục:", err);
      setCategories([]);
    }
  };

  const handleSort = (field) => {
    const isAsc = sort.field === field && sort.order === "asc";
    setSort({ field, order: isAsc ? "desc" : "asc" });
  };

  const getAllChildCategoryIds = (categoryId, categories) => {
    const ids = [categoryId];
    const findChildren = (currentId) => {
      const children = categories.filter(cat => cat.parent === currentId);
      children.forEach(child => {
        ids.push(child._id);
        findChildren(child._id);
      });
    };
    findChildren(categoryId);
    return ids;
  };

  const filteredAndSortedProducts =
    (products || [])
      .filter((p) => {
      const normalizedCatName = removeDiacritics(p.name);
      const normalizedFilterName = removeDiacritics(filterKeyword);
  
      const matchName = normalizedCatName.includes(normalizedFilterName);
      let matchCategory = true;

      if (filterCategory) {
        const categoryIdsToMatch = getAllChildCategoryIds(filterCategory, categories);
        matchCategory = categoryIdsToMatch.includes(p.category?._id);
      }

      return matchName && matchCategory;
    })
    .sort((a, b) => {
      if (!sort.field || !sort.order) {
        return 0;
      }

      let valA = a[sort.field];
      let valB = b[sort.field];

      if (sort.field === 'price' || sort.field === 'stock') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else if (sort.field === 'updatedAt') {
        valA = new Date(a.updatedAt);
        valB = new Date(b.updatedAt);
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) {
        return sort.order === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sort.order === 'asc' ? 1 : -1;
      }
      return 0;
    });


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = (product = null) => {
    if (product) {
      setFormData({
        ...product,
        images: Array.isArray(product.images) ? product.images : [],
        specs: Array.isArray(product.specs) ? product.specs : [],
        category: product.category?._id || "", // Ensure category is just the ID, handle potential null/undefined category
      });
      setEditingProduct(product);
    } else {
      setFormData({
        name: '',
        price: '',
        stock: '',
        category: '',
        description: '',
        images: [],
        specs: [],
        status: 'active', // Default status for new products
      });
      setEditingProduct(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSpecChange = (index, field, value) => {
    const updatedSpecs = [...formData.specs];
    updatedSpecs[index][field] = value;
    setFormData({ ...formData, specs: updatedSpecs });
  };

  const handleAddSpec = () => {
    setFormData({ ...formData, specs: [...formData.specs, { label: '', value: '' }] });
  };

  const handleRemoveSpec = (index) => {
    const updatedSpecs = formData.specs.filter((_, i) => i !== index);
    setFormData({ ...formData, specs: updatedSpecs });
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const urls = await Promise.all(files.map(file => UploadService.uploadImage(file)));

    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...urls]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingProduct) {
        await ProductService.updateProduct(editingProduct._id, formData);
      } else {
        await ProductService.createProduct(formData);
      }
      handleClose();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá?')) {
      setLoading(true);
      try {
        await ProductService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error(err);
        alert("An error occurred while deleting the product.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Bulk action handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const allProductIds = filteredAndSortedProducts.map((n) => n._id);
      setSelectedProducts(allProductIds);
      return;
    }
    setSelectedProducts([]);
  };

  const handleProductSelect = (event, id) => {
    const selectedIndex = selectedProducts.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedProducts, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedProducts.slice(1));
    } else if (selectedIndex === selectedProducts.length - 1) {
      newSelected = newSelected.concat(selectedProducts.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedProducts.slice(0, selectedIndex),
        selectedProducts.slice(selectedIndex + 1),
      );
    }
    setSelectedProducts(newSelected);
  };

  const handleOpenBulkActionDialog = (type) => {
    setBulkActionType(type);
    setOpenBulkActionDialog(true);
  };

  const handleCloseBulkActionDialog = () => {
    setOpenBulkActionDialog(false);
    setNewCategory('');
    setNewStatus('');
  };

  const handleBulkCategoryChange = async () => {
    setLoading(true);
    try {
      if (newCategory && selectedProducts.length > 0) {
        await ProductService.bulkUpdateProducts({
          productIds: selectedProducts,
          updateData: { category: newCategory },
        });
        handleCloseBulkActionDialog();
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật danh mục hàng loạt:", err);
      alert("An error occurred while bulk updating categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async () => {
    setLoading(true);
    try {
      if (newStatus && selectedProducts.length > 0) {
        await ProductService.bulkUpdateProducts({
          productIds: selectedProducts,
          updateData: { status: newStatus },
        });
        handleCloseBulkActionDialog();
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái hàng loạt:", err);
      alert("An error occurred while bulk updating statuses.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xoá ${selectedProducts.length} sản phẩm đã chọn? Thao tác này không thể hoàn tác.`)) {
      setLoading(true);
      try {
        await ProductService.bulkDeleteProducts(selectedProducts);
        handleCloseBulkActionDialog();
        setSelectedProducts([]);
        fetchProducts();
      } catch (err) {
        console.error("Lỗi khi xoá sản phẩm hàng loạt:", err);
        alert("An error occurred while bulk deleting products.");
      } finally {
        setLoading(false);
      }
    }
  };


  const isSelected = (id) => selectedProducts.indexOf(id) !== -1;

  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography variant="h5" gutterBottom style={{ color: '#328E6E', fontWeight: "bold" }}>Quản lý sản phẩm</Typography>
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            style={{ backgroundColor: '#059669', color: '#fff' }}
            onClick={() => handleOpen()}
          >
            Thêm sản phẩm
          </Button>
        </div>
        {loading ? <CircularProgress /> : (
          <div>
            <Card sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{xs:12, sm:6, md: 3}}>
                  <TextField
                    label="Tìm theo tên"
                    size="small"
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword( e.target.value || '')}
                    fullWidth
                    sx={{ minWidth: 150 }}
                  />
                </Grid>

                <Grid size={{xs:12, sm:6, md: 3}}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      value={filterCategory}
                      label="Danh mục"
                      sx={{ minWidth: 150 }}
                      onChange={(e) => setFilterCategory(e.target.value || '')}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                          },
                        },
                      }}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {categories.map((c) => (
                        <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{xs:12, sm:6, md: 3}}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Ngày cập nhật</InputLabel>
                    <Select
                      value={sort.order}
                      label="Ngày cập nhật"
                      sx={{ minWidth: 150 }}
                      onChange={(e) => setSort(() => ({
                        field: 'updatedAt',
                        order: e.target.value,
                      }))}
                    >
                      <MenuItem value="desc">Mới nhất</MenuItem>
                      <MenuItem value="asc">Cũ nhất</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{xs:12, sm:6, md: 2}}>
                  <Button
                    startIcon={<LuRefreshCw />}
                    color="success"
                    variant="outlined"
                    onClick={() => {
                      setFilterKeyword('');
                      setFilterCategory('');
                      setSort({ field: '', order: '' });
                      setSelectedProducts([]);
                    }}
                    sx={{ minWidth: 100 }}
                    fullWidth
                  >
                    RESET
                  </Button>
                </Grid>
              </Grid>
            </Card>

            {selectedProducts.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpenBulkActionDialog('category')}
                >
                  Đổi danh mục ({selectedProducts.length})
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleOpenBulkActionDialog('status')}
                >
                  Đổi trạng thái ({selectedProducts.length})
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleOpenBulkActionDialog('delete')}
                >
                  Xoá đã chọn ({selectedProducts.length})
                </Button>
              </Box>
            )}

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedProducts.length > 0 && selectedProducts.length < filteredAndSortedProducts.length}
                        checked={filteredAndSortedProducts.length > 0 && selectedProducts.length === filteredAndSortedProducts.length}
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sort.field === "name"}
                        direction={sort.order}
                        onClick={() => handleSort("name")}
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1rem"
                        }}
                      >
                        Tên sản phẩm
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sort.field === "price"}
                        direction={sort.order}
                        onClick={() => handleSort("price")}
                        sx={{ fontWeight: "bold", fontSize: "1rem" }}
                      >
                        Giá
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sort.field === "stock"}
                        direction={sort.order}
                        onClick={() => handleSort("stock")}
                        sx={{ fontWeight: "bold", fontSize: "1rem" }}
                      >
                        Kho
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Danh mục
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Ảnh
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Trạng thái
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        Không tìm thấy sản phẩm nào theo bộ lọc.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => {
                      const isItemSelected = isSelected(p._id);
                      return (
                        <TableRow
                          hover
                          onClick={(event) => handleProductSelect(event, p._id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={p._id}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${p._id}` }}
                            />
                          </TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.price} vnđ</TableCell>
                          <TableCell>{p.stock}</TableCell>
                          <TableCell>{p.category?.name}</TableCell>
                          <TableCell>
                            {p.images?.length > 0 && (
                              <img src={p.images[0]} alt="img" width="50" height="50" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography color={p.status === 'active' ? 'success.main' : 'text.secondary'} fontWeight="bold">
                              {p.status === 'active' ? 'Active' : 'Inactive'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton color="info" size="medium" onClick={(e) => { e.stopPropagation(); handleOpen(p); }}><AiOutlineEdit /></IconButton>
                            <IconButton color="error" size="medium" onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}><FaRegTrashCan /></IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  
                </TableBody>
              </Table>
            </TableContainer>
            <CustomTablePagination
              count={filteredAndSortedProducts.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
            />
          </div>
        )}

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle style={{ color: '#328E6E', fontWeight: "bold" }}>{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
          <DialogContent>
            <TextField label="Tên" name="name" fullWidth margin="normal" value={formData.name} onChange={handleChange} />
            <TextField label="Giá" name="price" fullWidth margin="normal" value={formData.price} onChange={handleChange} />
            <TextField label="Kho" name="stock" fullWidth margin="normal" value={formData.stock} onChange={handleChange} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Trạng thái"
                onChange={handleChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="h6" sx={{ mt: 2 }}>Danh mục</Typography>
            <CategoryTreeSelect
              categories={categories}
              selectedId={formData.category} // Pass the ID directly
              onSelect={(id) => setFormData({ ...formData, category: id })}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>Hình ảnh</Typography>


            <Button startIcon={<RiImageAddLine />} component="label">
              Tải ảnh lên
              <input hidden multiple type="file" onChange={handleMultipleImageUpload} />

            </Button>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {formData.images?.map((img, i) => (
                <Box key={i} sx={{ position: 'relative' }}>
                  <img src={img} alt={`img-${i}`} width="80" height="80" style={{ borderRadius: 4 }} />
                  <Button
                    size="small"
                    sx={{
                      position: 'absolute', top: 0, right: 0, minWidth: 0, padding: '2px',
                      background: 'rgba(255,255,255,0.7)'
                    }}
                    onClick={() => {
                      const newImages = formData.images.filter((_, idx) => idx !== i);
                      setFormData({ ...formData, images: newImages });
                    }}
                  >X</Button>
                </Box>
              ))}
            </Box>

            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>Thông số kỹ thuật</Typography>
            {Array.isArray(formData.specs) && formData.specs.map((spec, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <TextField variant="filled" size="small" label="Tên thông số" value={spec.label} onChange={(e) => handleSpecChange(index, 'label', e.target.value)} />
                <TextField variant="filled" size="small" label="Giá trị" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} />
                <IconButton color="error" size="medium" onClick={() => handleRemoveSpec(index)}><RiCloseLargeLine /></IconButton>
              </div>
            ))}
            <Button size="small" startIcon={<FaPlus />} color="success" onClick={handleAddSpec}>
              Thêm thông số
            </Button>
            <Typography variant="h6" sx={{ mt: 2 }}>Mô tả chi tiết</Typography>
            <Editor
              apiKey={import.meta.env.VITE_TINIMCE_API_KEY}
              initialValue={formData.description || ''}
              value={formData.description || ''}
              init={{
                height: 1000,
                menubar: false,
                plugins: ['link', 'image', 'code', 'lists', 'table', 'colorpicker', 'textcolor', 'autoresize'],
                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code | link image table | forecolor backcolor',
              }}
              onEditorChange={(value) => setFormData({ ...formData, description: value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Huỷ</Button>
            <Button variant="contained" onClick={handleSubmit} style={{ backgroundColor: '#059669' }}>Lưu</Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Action Dialog */}
        <Dialog open={openBulkActionDialog} onClose={handleCloseBulkActionDialog} fullWidth maxWidth="sm">
          <DialogTitle>
            {bulkActionType === 'category' && 'Đổi danh mục hàng loạt'}
            {bulkActionType === 'status' && 'Đổi trạng thái hàng loạt'}
            {bulkActionType === 'delete' && 'Xoá sản phẩm đã chọn'}
          </DialogTitle>
          <DialogContent>
            {bulkActionType === 'category' && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Danh mục mới</InputLabel>
                <Select
                  value={newCategory}
                  label="Danh mục mới"
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {bulkActionType === 'status' && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Trạng thái mới</InputLabel>
                <Select
                  value={newStatus}
                  label="Trạng thái mới"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Không hoạt động</MenuItem>
                </Select>
              </FormControl>
            )}
            {bulkActionType === 'delete' && (
              <Typography>
                Bạn có chắc chắn muốn xoá **{selectedProducts.length}** sản phẩm đã chọn? Thao tác này không thể hoàn tác.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBulkActionDialog}>Huỷ</Button>
            {bulkActionType === 'category' && (
              <Button variant="contained" onClick={handleBulkCategoryChange} disabled={!newCategory} style={{ backgroundColor: '#059669' }}>
                Cập nhật
              </Button>
            )}
            {bulkActionType === 'status' && (
              <Button variant="contained" onClick={handleBulkStatusChange} disabled={!newStatus} style={{ backgroundColor: '#059669' }}>
                Cập nhật
              </Button>
            )}
            {bulkActionType === 'delete' && (
              <Button variant="contained" onClick={handleBulkDelete} color="error">
                Xoá
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProductManager;