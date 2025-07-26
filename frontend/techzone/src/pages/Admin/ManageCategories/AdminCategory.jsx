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
  FormControlLabel, 
  CircularProgress,
  TablePagination,
  Box,
  Checkbox,
  Grid
} from "@mui/material";
import { AiOutlineEdit } from "react-icons/ai";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";
import { RiCloseLargeLine } from "react-icons/ri";
import CategoryTreeSelector from "../../../components/treeView/categoryTreeSelect";
import { LuRefreshCw } from "react-icons/lu";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [formDialog, setFormDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState("");
  const [filterParent, setFilterParent] = useState("");
  const [showRootOnly, setShowRootOnly] = useState(false);


  const [form, setForm] = useState({
    name: "",
    description: "",
    id: null,
    parent: null,
    icon: "",
    iconFile: null,
    specifications:[],
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
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const filteredCategories = categories.filter((cat) => {
    const matchName = cat.name.toLowerCase().includes(filterName.toLowerCase());

    const matchParent =
      filterParent === "" ||
      (cat.parent === filterParent);

    const matchRoot = !showRootOnly || !cat.parent;

    return matchName && matchParent && matchRoot;
  });

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      specifications: !form.parent ? form.specifications : [],
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
      specifications: cat.specifications || [],
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
    <Card>
      <CardContent>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Typography variant="h5"
            fontWeight="bold"
            style={{ color: '#059669', fontWeight: 'bold' }}
          >
            Quản lý danh mục
          </Typography>
          <Button
            variant="contained"
            onClick={() => setFormDialog(true)}
            startIcon={<FaPlus/>}
            style={{ backgroundColor: '#059669', color: '#fff' }}
          >
            Thêm danh mục
          </Button>
        </div>

        <Card sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} sx={{ my: 2 }}> 
            <Grid size={{ xs: 12, sm:6, md: 3}}> 
              <TextField
                label="Tìm theo tên"
                size="small"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                fullWidth 
                sx={{ minWidth: 150 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm:6, md: 3}}>
              <FormControl size="small" fullWidth sx={{ minWidth: 150 }}> 
                <InputLabel>Danh mục</InputLabel>
                <Select
                  name="categoryId"
                  value={filterParent}
                  label="Danh mục"
                  onChange={(e) => setFilterParent(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  <MenuItem value="">-- Tất cả --</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm:6, md: 4}}>
              <FormControlLabel
                fullWidth
                sx={{ minWidth: 150 }}
                control={
                  <Checkbox
                    checked={showRootOnly}
                    onChange={(e) => setShowRootOnly(e.target.checked)}
                  />
                }
                label="Chỉ hiển thị danh mục gốc"
              />
            </Grid>
            <Grid size={{ xs: 12, sm:6, md: 2}}>
              <Button
                startIcon={<LuRefreshCw/>}
                color="success"
                variant="outlined"
                onClick={() => {
                  setFilterName("");
                  setFilterParent("");
                  setShowRootOnly(false);
                }}
                fullWidth
                sx={{ minWidth: 100 }}
              >
                RESET
              </Button>
            </Grid>
          </Grid>
        </Card>

        {loading ? (
          <CircularProgress color="primary" />
        ) : (
          <div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                  <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                  <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}}>Icon</TableCell>
                  <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}}>Tên</TableCell>
                  <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}}>Mô tả</TableCell>
                  <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}}>Danh mục cha</TableCell>
                  <TableCell sx={{fontWeigth: "bold", fontSize: "1rem"}} align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cat) => (
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
          <TablePagination
            component="div"
            count={filteredCategories.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20]}
              />
          </div>
        )}

        <Dialog open={formDialog} onClose={() => setFormDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle style={{color: "#328E6E"}}>{form.id ? "Cập nhật danh mục" : "Thêm danh mục"}</DialogTitle>
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
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Danh mục cha
            </Typography>
            <CategoryTreeSelector
              categories={categories.filter(c => c._id !== form.id)}
              selectedId={form.parent}
              onSelect={(id) => setForm({ ...form, parent: id })}
            />

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
            {!form.parent && (
              <div style={{ marginTop: 16 }}>
                <Typography variant="subtitle1" color="primary">
                  Thông số kỹ thuật mặc định
                </Typography>

                {Array.isArray(form.specifications) &&
                  form.specifications.map((spec, index) => (
                  <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <TextField variant="filled" size="small"
                      label="Tên thông số"
                      value={spec.label}
                      onChange={(e) => {
                        const updated = [...form.specifications];
                        updated[index].label = e.target.value;
                        setForm({ ...form, specifications: updated });
                      }}
                      fullWidth
                    />
                      <IconButton
                        color="error"
                        size="medium"
                        onClick={() => {
                          const updated = [...form.specifications];
                          updated.splice(index, 1);
                          setForm({ ...form, specifications: updated });
                        }}
                      >
                        <RiCloseLargeLine />
                      </IconButton>
                  </div>
                ))}

              <Button
                size="small"
                startIcon={<FaPlus />}
                color="success"
                onClick={() =>
                  setForm({
                    ...form,
                    specifications: [...form.specifications, { label: "" }],
                  })
                }
              >
                Thêm thông số
              </Button>
            </div>
          )}

          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormDialog(false)}>Hủy</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              style={{ backgroundColor: '#328E6E' }}>
              {form.id ? "Cập nhật" : "Lưu"}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;