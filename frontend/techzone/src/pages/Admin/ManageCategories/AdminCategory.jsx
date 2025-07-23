import React, { useEffect, useState } from "react";
import CategoryService from "../../../services/CategoryService";
import UploadService from "../../../services/UploadService";
import {
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { AiOutlineEdit } from "react-icons/ai";
import { FaRegTrashCan } from "react-icons/fa6";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [formDialog, setFormDialog] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    id: null,
    parent: null,
    icon: "",
    iconFile: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const data = await CategoryService.getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleUploadIcon = async (file) => {
    
    console.log("Uploading icon:", file.name);
    const url = await UploadService.uploadIcon(file);
    console.log("Icon uploaded successfully:", url);
    return url;
  };

  const handleSubmit = async () => {
    let iconUrl = form.icon;
    if (form.iconFile) {
      iconUrl = await handleUploadIcon(form.iconFile);
    }

    const payload = {
      name: form.name,
      description: form.description,
      parent: form.parent || null,
      icon: iconUrl,
    };

    if (form.id) {
      await CategoryService.updateCategory(form.id, payload);
    } else {
      await CategoryService.createCategory(payload);
    }

    setForm({
      name: "",
      description: "",
      id: null,
      parent: null,
      icon: "",
      iconFile: null,
    });
    setFormDialog(false);
    fetchCategories();
  };

  const handleEdit = (cat) => {
    setForm({
      name: cat.name,
      description: cat.description,
      id: cat._id,
      parent: cat.parent || null,
      icon: cat.icon || "",
      iconFile: null,
    });
    setFormDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xoá danh mục này?")) {
      await CategoryService.deleteCategory(id);
      fetchCategories();
    }
  };

  return (
    <Card elevation={3} style={{ margin: "1rem" }}>
      <CardContent>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Quản lý Danh mục
          </Typography>
          <Button variant="contained" color="success" onClick={() => setFormDialog(true)}>
            Thêm danh mục
          </Button>
        </div>

        {loading ? (
          <CircularProgress color="primary" />
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f0fdf4' }}>
                  <TableCell>Icon</TableCell>
                  <TableCell>Tên</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Danh mục cha</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat._id}>
                    <TableCell>
                      {cat.icon ? <img src={cat.icon} alt="icon" width={24} height={24} /> : "-"}
                    </TableCell>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>{cat.description}</TableCell>
                    <TableCell>
                      {typeof cat.parent === "object"
                        ? cat.parent?.name
                        : categories.find((c) => c._id === cat.parent)?.name || "-"}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="info" size="small" onClick={() => handleEdit(cat)}><AiOutlineEdit /></IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(cat._id)}><FaRegTrashCan /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={formDialog} onClose={() => setFormDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>{form.id ? "Cập nhật danh mục" : "Thêm danh mục"}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Tên danh mục"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth required
            />
            <TextField
              margin="dense"
              label="Mô tả"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Danh mục cha</InputLabel>
              <Select
                value={form.parent || ""}
                onChange={(e) => setForm({ ...form, parent: e.target.value || null })}
                label="Danh mục cha"
              >
                <MenuItem value="">-- Không có --</MenuItem>
                {categories
                  .filter((c) => c._id !== form.id)
                  .map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              type="file"
              inputProps={{ accept: "image/svg+xml" }}
              onChange={(e) => setForm({ ...form, iconFile: e.target.files[0] || null })}
              fullWidth
              margin="dense"
            />
            {form.icon && (
              <div style={{ marginTop: 10 }}>
                <Typography variant="caption">Icon hiện tại:</Typography>
                <br />
                <img src={form.icon} alt="icon" width={32} height={32} />
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormDialog(false)}>Hủy</Button>
            <Button onClick={handleSubmit} variant="contained" color="success">
              {form.id ? "Cập nhật" : "Lưu"}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;