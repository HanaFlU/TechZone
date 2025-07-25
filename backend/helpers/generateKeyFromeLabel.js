const generateKeyFromLabel = (label) => {
    return label
        .normalize("NFD")               // chuẩn hóa Unicode
        .replace(/[\u0300-\u036f]/g, "") // loại bỏ dấu
        .replace(/\s+/g, "_")           // thay khoảng trắng bằng _
        .replace(/[^\w_]/g, "")         // loại ký tự đặc biệt
        .toLowerCase();                 // chuyển thành lowercase
};


module.exports = generateKeyFromLabel;