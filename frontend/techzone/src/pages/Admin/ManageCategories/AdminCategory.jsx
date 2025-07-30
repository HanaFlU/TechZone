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
  Checkbox,
  Grid
} from "@mui/material";
import { toast } from "react-toastify";
import { AiOutlineEdit } from "react-icons/ai";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";
import { RiCloseLargeLine } from "react-icons/ri";
import CategoryTreeSelector from "../../../components/treeView/categoryTreeSelect";
import { LuRefreshCw } from "react-icons/lu";
import removeDiacritics from "../../../utils/removeDiacritics";
import CustomTablePagination from "../../../components/CustomPagination";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [batchUpdateParentDialog, setBatchUpdateParentDialog] = useState(false);
  const [newParentForBatch, setNewParentForBatch] = useState("");
  const [formDialog, setFormDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState("");
  const [filterParent, setFilterParent] = useState("");
  const [showRootOnly, setShowRootOnly] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    parent: null,
    icon: "",
    iconFile: null,
    specifications: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await CategoryService.getCategories();
      setCategories(data || []);
      setSelectedCategoryIds([]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError( "Lỗi khi tải danh mục.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const filteredCategories = categories.filter((cat) => {
    const normalizedCatName = removeDiacritics(cat.name);
    const normalizedFilterName = removeDiacritics(filterName);

    const matchName = normalizedCatName.includes(normalizedFilterName);

    // Filter by parent, including "no parent" option (null/undefined)
    const matchParent =
      filterParent === "" || // "-- Tất cả --" option
      (filterParent === "null" && !cat.parent) || //"-- Danh mục gốc --" option
      (cat.parent && cat.parent === filterParent); // Filter for specific parent ID

    const matchRoot = !showRootOnly || !cat.parent;

    return matchName && matchParent && matchRoot;
  });

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUploadIcon = async (file) => {
    setLoading(true); // Indicate loading during upload
    try {
      const url = await UploadService.uploadIcon(file);
      toast.success("Icon đã được tải lên thành công!");
      return url;
    } catch (error) {
      console.error("Error uploading icon:", error);
      toast.error("Không thể tải icon lên. Vui lòng thử lại.");
      return form.icon; // Return existing icon if upload fails
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let iconUrl = form.icon;
      if (form.iconFile) {
        iconUrl = await handleUploadIcon(form.iconFile);
      }

      const payload = {
        name: form.name,
        slug: form.slug || "", 
        description: form.description,
        parent: form.parent || null,
        icon: iconUrl,
        specifications: !form.parent
          ? form.specifications.map((spec) => ({
              ...spec,
              key: spec.key || "",
            }))
          : [],
      };

      if (form.id) {
        await CategoryService.updateCategory(form.id, payload);
      } else {
        await CategoryService.createCategory(payload);
      }
      toast.success(form.id ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!");
      // Reset form and close dialog
      setForm({
        name: "",
        slug: "",
        description: "",
        id: null,
        parent: null,
        icon: "",
        iconFile: null,
        specifications: [],
      });
      setFormDialog(false);
      fetchCategories(); // Re-fetch categories to update the list
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi lưu danh mục.", 1000);
      console.error("Error saving category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({
      name: cat.name,
      slug: cat.slug, // Populate slug when editing
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
    if (window.confirm("Bạn có chắc chắn muốn xoá danh mục này?")) {
      setLoading(true);
      try {
        await CategoryService.deleteCategory(id);
        toast.success("Xoá danh mục thành công!");
        fetchCategories(); // Re-fetch categories to update the list
      } catch (error) {
        console.error("Error deleting category:", error);
        // Display the specific error message from the backend
        toast.error("Đã xảy ra lỗi khi xoá danh mục.");
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Hàm xử lý chọn/bỏ chọn một danh mục
  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryIds((prevSelected) =>
      prevSelected.includes(categoryId)
        ? prevSelected.filter((id) => id !== categoryId)
        : [...prevSelected, categoryId]
    );
  };

  // Hàm xử lý chọn/bỏ chọn tất cả danh mục hiển thị trên trang hiện tại
  const handleSelectAllCategories = (event) => {
    if (event.target.checked) {
      const allIdsOnPage = filteredCategories
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((cat) => cat._id);
      setSelectedCategoryIds(allIdsOnPage);
    } else {
      setSelectedCategoryIds([]);
    }
  };

  // Kiểm tra xem tất cả danh mục trên trang hiện tại có được chọn không
  const isAllSelectedOnPage =
    filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 &&
    filteredCategories
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .every((cat) => selectedCategoryIds.includes(cat._id));

  // Hàm xử lý cập nhật hàng loạt danh mục cha
  const handleBatchUpdateParent = async () => {
    if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một danh mục để cập nhật.");
      return;
    }


    setLoading(true);
    try {
      for (const categoryId of selectedCategoryIds) {
        // Đảm bảo không chọn chính nó làm danh mục cha
        if (categoryId === newParentForBatch) {
          toast.error("Cập nhật không thành công.");
          alert(`Không thể đặt danh mục '${categories.find(c => c._id === categoryId)?.name}' làm danh mục cha của chính nó.`);
          continue;
        }

        const selectedCat = categories.find(c => c._id === categoryId);
        if (selectedCat && selectedCat.parent === newParentForBatch) {
            // Nếu danh mục đã có cha là newParentForBatch, bỏ qua
            continue;
        }

        // Đảm bảo danh mục con không trở thành cha của chính nó hoặc tổ tiên của nó
        let currentParentId = newParentForBatch;
        let isCircular = false;
        while (currentParentId) {
            if (currentParentId === categoryId) {
                isCircular = true;
                break;
            }
            const parentCat = categories.find(c => c._id === currentParentId);
            currentParentId = parentCat ? parentCat.parent : null;
        }

        if (isCircular) {
          toast.error("Cập nhật không thành công.");
          alert(`Không thể đặt danh mục '${categories.find(c => c._id === categoryId)?.name}' làm con của '${categories.find(c => c._id === newParentForBatch)?.name}' vì sẽ tạo ra vòng lặp cha-con.`);
          continue;
        }

        await CategoryService.updateCategory(categoryId, { parent: newParentForBatch });
      }
      toast.success("Cập nhật danh mục cha thành công!");
      setBatchUpdateParentDialog(false);
      setNewParentForBatch(null);
      fetchCategories(); // Tải lại danh sách để hiển thị thay đổi
    } catch (error) {
      console.error("Error batch updating parent:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật danh mục cha.");
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật danh mục cha.");
    } finally {
      setLoading(false);
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
            onClick={() => {
              setForm({ // Reset form when opening for new category
                id: null, name: "", slug: "", description: "", parent: null, icon: "", iconFile: null, specifications: []
              });
              setFormDialog(true);
            }}
            startIcon={<FaPlus />}
            style={{ backgroundColor: '#059669', color: '#fff' }}
          >
            Thêm danh mục
          </Button>
          <Button
            variant="contained"
            onClick={() => setBatchUpdateParentDialog(true)}
            disabled={selectedCategoryIds.length === 0}
            startIcon={<AiOutlineEdit />}
            style={{ backgroundColor: selectedCategoryIds?.length === 0 ? '#cccccc' : '#1976d2', color: '#fff' }}
          >
            Thay đổi danh mục cha ({selectedCategoryIds.length})
          </Button>
        </div>

        <Card sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} sx={{ my: 2 }}>
            <Grid size={{xs:12, sm:6, md: 3}}>
              <TextField
                label="Tìm theo tên"
                size="small"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                fullWidth
                sx={{ minWidth: 150 }}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md: 3}}>
              <FormControl size="small" fullWidth sx={{ minWidth: 150 }}>
                <InputLabel>Danh mục cha</InputLabel> {/* Changed label for clarity */}
                <Select
                  name="filterParent"
                  value={filterParent}
                  label="Danh mục cha"
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
                  <MenuItem value="null">-- Danh mục gốc --</MenuItem> {/* Option to explicitly filter for root categories */}
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12, sm:6, md: 3}}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showRootOnly}
                    onChange={(e) => setShowRootOnly(e.target.checked)}
                  />
                }
                label="Chỉ hiển thị danh mục gốc"
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md: 2}}>
              <Button
                startIcon={<LuRefreshCw />}
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
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ): (
          <div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        onChange={handleSelectAllCategories}
                        checked={isAllSelectedOnPage}
                        indeterminate={selectedCategoryIds.length > 0 && !isAllSelectedOnPage}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Icon</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Tên</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Slug</TableCell> {/* Add Slug column */}
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Mô tả</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Danh mục cha</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }} align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    {filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          Không tìm thấy danh mục con nào theo bộ lọc.
                        </TableCell>
                      </TableRow>
                    ) : (
                        filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cat) => (
                          <TableRow key={cat._id}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedCategoryIds.includes(cat._id)}
                                onChange={() => handleSelectCategory(cat._id)}
                              />
                            </TableCell>
                            <TableCell>
                              {cat.icon ? <img src={cat.icon} alt="icon" width={24} height={24} /> : "-"}
                            </TableCell>
                            <TableCell>{cat.name}</TableCell>
                            <TableCell>{cat.slug}</TableCell> {/* Display slug */}
                            <TableCell>{cat.description}</TableCell>
                            <TableCell>
                              {/* Ensure correct parent name display from categories array */}
                              {categories.find((c) => c._id === cat.parent)?.name || "Không có"}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton color="info" size="small" onClick={() => handleEdit(cat)}><AiOutlineEdit /></IconButton>
                              <IconButton color="error" size="small" onClick={() => handleDelete(cat._id)}><FaRegTrashCan /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    }
                </TableBody>
              </Table>
            </TableContainer>
            <CustomTablePagination
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
          <DialogTitle style={{ color: "#328E6E" }}>{form.id ? "Cập nhật danh mục" : "Thêm danh mục"}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              name="name"
              label="Tên danh mục"
              type="text"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value})}
              required
            />
            <TextField
              margin="dense"
              name="slug"
              label="Slug (Tùy chọn, sẽ tự tạo nếu để trống)"
              type="text"
              fullWidth
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <TextField
              margin="dense"
              name="description"
              label="Mô tả"
              type="text"
              fullWidth
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Danh mục cha
            </Typography>
            <CategoryTreeSelector
              categories={categories.filter(c => c._id !== form.id)} // Exclude current category from parent selection
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
            {!form.parent && ( // Only show specifications if it's a root category
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
                      <TextField
                        variant="filled"
                        size="small"
                        label="Key (sẽ tự tạo nếu để trống)"
                        value={spec.key}
                        onChange={(e) => {
                          const updated = [...form.specifications];
                          updated[index].key = e.target.value;
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
                      specifications: [...form.specifications, { label: "", key: "" }], // Initialize with empty key
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
        <Dialog open={batchUpdateParentDialog} onClose={() => setBatchUpdateParentDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle style={{ color: "#1976d2" }}>Thay đổi danh mục cha cho ({selectedCategoryIds.length}) danh mục đã chọn</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Chọn danh mục cha mới:
            </Typography>
            <CategoryTreeSelector
              categories={categories.filter(c => !selectedCategoryIds.includes(c._id))}
              selectedId={newParentForBatch}
              onSelect={(id) => setNewParentForBatch(id)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBatchUpdateParentDialog(false)}>Hủy</Button>
            <Button
              onClick={handleBatchUpdateParent}
              variant="contained"
              color="primary"
            >
              Cập nhật
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;