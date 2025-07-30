// backend/routes/ReviewRoute.js
const express = require('express');
const ReviewController = require('../controllers/ReviewController');
const { checkPermission, protect } = require('../midleware/AuthMiddleware.js');
const router = express.Router();

router.post('/', protect, ReviewController.createReview);
router.get('/:productId', ReviewController.getReviewsByProductId);
router.get('/:productId/my-review', protect, ReviewController.getReviewByUserAndProduct);
router.get('/featured/high-rated', ReviewController.getProductsWithHighRatings);
module.exports = router;