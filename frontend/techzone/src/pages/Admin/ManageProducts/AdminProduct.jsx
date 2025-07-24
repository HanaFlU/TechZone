// ProductManager.jsx
import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  CircularProgress, Select, MenuItem, InputLabel, FormControl,
  Autocomplete,
  ListItemText,
  Box,
} from '@mui/material';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
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

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    images: '',
    specs: []
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const data = await ProductService.getAllProducts();
    console.log("Fetched products:", data);
    setProducts(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await CategoryService.getCategories();
    console.log("Fetched categories:", res);
    setCategories(res);
  };

  const handleOpen = (product = null) => {
    if (product) {
      setFormData(product);
      setEditingProduct(product);
    } else {
      setFormData({ name: '', price: '', stock: '', category: '', image: '', specs: [] });
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
    setFormData({ ...formData, images: [...formData.images || [], ...urls] });
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
        <Typography variant="h5" gutterBottom>Quản lý sản phẩm</Typography>
        <Button variant="contained" startIcon={<FaPlus />} onClick={() => handleOpen()}>Thêm sản phẩm</Button>
        {loading ? <CircularProgress /> : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên</TableCell>
                  <TableCell>Giá</TableCell>
                  <TableCell>Kho</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell>Ảnh</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.price}đ</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>{p.category?.name}</TableCell>
                    <TableCell>
                      <img src={p.image} alt="img" width="50" height="50" />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpen(p)}><FaEdit /></IconButton>
                      <IconButton onClick={() => handleDelete(p._id)}><FaTrash /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
          <DialogContent>
            <TextField label="Tên" name="name" fullWidth margin="normal" value={formData.name} onChange={handleChange} />
            <TextField label="Giá" name="price" fullWidth margin="normal" value={formData.price} onChange={handleChange} />
            <TextField label="Kho" name="stock" fullWidth margin="normal" value={formData.stock} onChange={handleChange} />
            <Typography variant="h6" sx={{ mt: 2 }}>Danh mục</Typography>
            <CategoryTreeSelect
              categories={categories}
              selectedId={formData.category._id}
              onSelect={(id) => setFormData({ ...formData, category: id })}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>Hình ảnh</Typography>


            <Button component="label">
              Tải ảnh lên
              <input hidden multiple type="file" onChange={handleMultipleImageUpload} />  
              
            </Button>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {(formData.images || []).map((img, i) => (
                <img key={i} src={img} alt={`img-${i}`} width="80" height="80" style={{ borderRadius: 4 }} />
              ))}
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>Thông số kỹ thuật</Typography>
            {formData.specs.map((spec, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <TextField label="Label" value={spec.label} onChange={(e) => handleSpecChange(index, 'label', e.target.value)} />
                <TextField label="Value" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} />
                <Button color="error" onClick={() => handleRemoveSpec(index)}>Xoá</Button>
              </div>
            ))}
            <Button onClick={handleAddSpec}>Thêm thông số</Button>
            <TextField label="Mô tả ngắn" name="shortDesc" fullWidth multiline rows={3} value={formData.shortDesc || ''} onChange={handleChange} />

            <Typography variant="h6" sx={{ mt: 2 }}>Mô tả chi tiết</Typography>
            <Editor
              apiKey={import.meta.env.VITE_TINIMCE_API_KEY}
              initialValue={formData.description || ''}
              value={formData.description || ''}
              init={{
                height: 300,
                menubar: false,
                plugins: ['link', 'image', 'code', 'lists', 'table','colorpicker', 'textcolor', 'autoresize'],
                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code | link image table | forecolor backcolor',
              }}
              onEditorChange={(value) => setFormData({ ...formData, description: value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Huỷ</Button>
            <Button variant="contained" onClick={handleSubmit}>Lưu</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProductManager;