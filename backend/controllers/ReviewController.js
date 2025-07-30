const Review = require('../models/ReviewModel');
const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const Customer = require('../models/CustomerModel');
const Product = require('../models/ProductModel');
const mongoose = require('mongoose');

const ReviewController = {
    createReview: async (req, res) => {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;
        if (!productId || !rating) {
            return res.status(400).json({ message: 'ProductId và Rating là bắt buộc.' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating phải từ 1 đến 5.' });
        }

        try {
            const customerProfile = await Customer.findOne({ user: userId });
            if (!customerProfile) {
                return res.status(403).json({ message: 'Bạn không có hồ sơ khách hàng để thực hiện đánh giá.' });
            }
            const customerId = customerProfile._id;
            const hasPurchased = await Order.findOne({
                customer: customerId,
                status: 'DELIVERED',
                'items.product': productId
            });
            if (!hasPurchased) {
                return res.status(403).json({ message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua và đã được giao.' });
            }
            const existingReview = await Review.findOne({ productId, userId });
            if (existingReview) {
                return res.status(409).json({ message: 'Bạn đã đánh giá sản phẩm này rồi.' });
            }
            const newReview = new Review({
                productId,
                userId,
                rating,
                comment: comment || '',
            });

            await newReview.save();
            res.status(201).json({ message: 'Đánh giá đã được tạo thành công.', review: newReview });

        } catch (error) {
            console.error('Lỗi khi tạo đánh giá:', error);
            if (error.code === 11000) {
                return res.status(409).json({ message: 'Bạn đã đánh giá sản phẩm này rồi.' });
            }
            res.status(500).json({ message: 'Lỗi server khi tạo đánh giá.', error: error.message });
        }
    },

    getReviewsByProductId: async (req, res) => {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
        }

        try {
            const reviews = await Review.find({ productId })
                .populate("userId")
            res.status(200).json(reviews);
        } catch (error) {
            console.error('Lỗi khi lấy đánh giá theo sản phẩm:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy đánh giá.', error: error.message });
        }
    },

    getReviewByUserAndProduct: async (req, res) => {
        const { productId } = req.params;
        const userId = req.user.id

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
        }

        try {
            const review = await Review.findOne({ productId, userId })
                .populate('userId', 'username email');

            if (!review) {
                return res.status(404).json({ message: 'Không tìm thấy đánh giá của bạn cho sản phẩm này.' });
            }
            res.status(200).json(review);
        } catch (error) {
            console.error('Lỗi khi lấy đánh giá của người dùng cho sản phẩm:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy đánh giá.', error: error.message });
        }
    },

    getProductsWithHighRatings: async (req, res) => {
        const { minRating = 4, limit = 10 } = req.query;

        try {
            // First, check if there are any reviews at all
            const totalReviews = await Review.countDocuments();
            
            if (totalReviews === 0) {
                return res.status(200).json([]);
            }

            // Aggregate reviews to get average rating for each product
            const productsWithRatings = await Review.aggregate([
                {
                    $group: {
                        _id: '$productId',
                        averageRating: { $avg: '$rating' },
                        reviewCount: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        averageRating: { $gte: parseFloat(minRating) }
                    }
                },
                {
                    $sort: { averageRating: -1, reviewCount: -1 }
                },
                {
                    $limit: parseInt(limit)
                }
            ]);

            // If no products with high ratings found, return empty array
            if (productsWithRatings.length === 0) {
                return res.status(200).json([]);
            }

            // Get product details for the products with high ratings
            const productIds = productsWithRatings.map(item => item._id);
            const products = await Product.find({ _id: { $in: productIds }, status: 'active' })
                .populate('category', 'name');

            // Combine product data with rating data
            const productsWithRatingData = products.map(product => {
                const ratingData = productsWithRatings.find(rating => rating._id.toString() === product._id.toString());
                return {
                    ...product.toObject(),
                    averageRating: ratingData.averageRating,
                    reviewCount: ratingData.reviewCount
                };
            });

            res.status(200).json(productsWithRatingData);
        } catch (error) {
            console.error('Lỗi khi lấy sản phẩm có đánh giá cao:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm có đánh giá cao.', error: error.message });
        }
    },
};

module.exports = ReviewController;