const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình Multer storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'category_icons', // folder bạn muốn upload trên cloudinary
        resource_type: 'image',   // hoặc 'auto'
        allowed_formats: ['jpg', 'png', 'svg'], // tuỳ định dạng
    },
});

module.exports = {
    cloudinary,
    storage,
};
