// ProductManager.jsx
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
} from '@mui/material';
import { FaPlus } from 'react-icons/fa';
import { AiOutlineEdit } from "react-icons/ai";
import { FaRegTrashCan } from "react-icons/fa6";
import { RiCloseLargeLine, RiImageAddLine } from "react-icons/ri";
import { CiFilter } from "react-icons/ci";
import { LuRefreshCw } from "react-icons/lu";


import ProductService from '../../../services/ProductService';
import CategoryService from '../../../services/CategoryService';
import UploadService from '../../../services/UploadService';
import CategoryTreeSelect from '../../../components/treeView/categoryTreeSelect';
import { Editor } from '@tinymce/tinymce-react';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState({
    keyword: '',
    category: '',
  });

  const [sort, setSort] = useState({
    field: '',
    order: '',
  });


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
  }, []);
  
  useEffect(() => {
    fetchCategories();
  }, []);
 
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};

      if (sort.field) {
        params.sortBy = sort.field;
        params.order = sort.order;
      }

      if (filter.keyword) {
        params.keyword = filter.keyword;
      }

      if (filter.category) {
        params.category = filter.category;
      }

      const data = await ProductService.getAllProducts(params);
      setProducts(data);
    } catch (err) {
      console.error("Lỗi khi fetch sản phẩm:", err);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await CategoryService.getCategories();
    setCategories(res);
  };

  const handleSort = (field) => {
    const isAsc = sort.field === field && sort.order === "asc";
    setSort({ field, order: isAsc ? "desc" : "asc" });
  };

  const getAllChildCategoryIds = (categoryId, categories) => {
    const ids = [categoryId]; // Bắt đầu với ID của chính danh mục đó
    const findChildren = (currentId) => {
      const children = categories.filter(cat => cat.parent === currentId);
      children.forEach(child => {
        ids.push(child._id);
        findChildren(child._id); // Đệ quy tìm con của con
      });
    };
    findChildren(categoryId);
    return ids;
  };
  const filteredAndSortedProducts =
    [...products]
    .filter((p) => {
      const matchName = p.name.toLowerCase().includes(filter?.keyword.toLowerCase());
      let matchCategory = true; // Mặc định là true nếu không có danh mục nào được chọn

      if (filter.category) {
        // Lấy tất cả các ID danh mục con của danh mục đã chọn
        const categoryIdsToMatch = getAllChildCategoryIds(filter.category, categories);
        // Kiểm tra xem ID danh mục của sản phẩm có nằm trong các ID cần khớp không
        matchCategory = categoryIdsToMatch.includes(p.category?._id);
      }

      return matchName && matchCategory;
    })
    // Giữ nguyên logic sắp xếp của bạn
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
      category: product.category || "",
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
        specs: []
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
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá?')) {
      await ProductService.deleteProduct(id);
      fetchProducts();
    }
  };


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
                <Grid size={{ xs: 12, sm:6, md: 3}}>
                  <TextField
                    label="Tìm theo tên"
                    size="small"
                    value={filter.keyword}
                    onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
                    fullWidth
                    sx={{ minWidth: 150 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm:6, md: 3}}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      value={filter.category}
                      label="Danh mục"
                      sx={{ minWidth: 150 }}
                      onChange={(e) => setFilter({ ...filter, category: e.target.value })}
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

                <Grid size={{ xs: 12, sm:6, md: 4}}>
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

                <Grid size={{ xs: 12, sm:6, md: 2}}> 
                  <Button
                    startIcon={<LuRefreshCw/>}
                    color="success"
                    variant="outlined"
                    onClick={() => {
                      setFilter({ keyword: "", category: "" });
                      setSort({ field: '', order: '' });
                    }}
                    sx={{ minWidth: 100 }}
                    fullWidth
                  >
                    RESET
                  </Button>
                </Grid>
              </Grid>
            </Card>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                      <TableCell>
                        <TableSortLabel
                          active={sort.field === "name"}
                          direction={sort.order}
                          onClick={() => handleSort("name")}
                          sx={{
                            fontWeigth: "bold",
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
                          sx={{fontWeigth: "bold", fontSize: "1rem"}}
                        >
                          Giá
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sort.field === "stock"}
                          direction={sort.order}
                          onClick={() => handleSort("stock")}
                          sx={{ fontWeigth: "bold", fontSize: "1rem" }}
                        >
                          Kho
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}}>
                        Danh mục
                      </TableCell>
                      <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}}
                      >
                        Ảnh
                      </TableCell>
                      <TableCell sx={{ fontWeigth: "bold", fontSize: "1rem" }}>
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                <TableBody>
                  {filteredAndSortedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
                    <TableRow key={p._id}>
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
                        <IconButton color="info" size="medium" onClick={() => handleOpen(p)}><AiOutlineEdit /></IconButton>
                        <IconButton color="error" size="medium" onClick={() => handleDelete(p._id)}><FaRegTrashCan /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
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
            <Typography variant="h6" sx={{ mt: 2 }}>Danh mục</Typography>
            <CategoryTreeSelect
              categories={categories}
              selectedId={formData.category._id}
              onSelect={(id) => setFormData({ ...formData, category: {...formData.category, _id: id }}) }
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

            <Typography variant="h6" sx={{ mt: 2, mb:2 }}>Thông số kỹ thuật</Typography>
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
                plugins: ['link', 'image', 'code', 'lists', 'table','colorpicker', 'textcolor', 'autoresize'],
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
      </CardContent>
    </Card>
  );
};

export default ProductManager;