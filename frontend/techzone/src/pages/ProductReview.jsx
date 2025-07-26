import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import ReviewService from '../services/ReviewService';
import useNotification from '../hooks/useNotification';
import { StarIcon } from '@heroicons/react/24/solid';

const ProductReview = ({ productId }) => {
  const { user } = useContext(AuthContext);
  const { displayNotification } = useNotification();
  
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [numberOfReviews, setNumberOfReviews] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  const calculateReviewStats = useCallback((fetchedReviews) => {
    if (!fetchedReviews || fetchedReviews.length === 0) {
        setAverageRating(0);
        setNumberOfReviews(0);
        setRatingCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        return;
    }

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    fetchedReviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
            counts[review.rating]++;
            totalRating += review.rating;
        }
    });

    setRatingCounts(counts);
    setNumberOfReviews(fetchedReviews.length);
    setAverageRating(totalRating / fetchedReviews.length);
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const fetchedReviews = await ReviewService.getReviewsByProductId(productId);
        setReviews(fetchedReviews);
        calculateReviewStats(fetchedReviews);
        if (user) {
          const review = await ReviewService.getMyReviewForProduct(productId);
          setMyReview(review);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId, user, calculateReviewStats]);

  const handleSubmitReview = async () => {
    if (rating < 1 || rating > 5) {
      displayNotification('Vui lòng chọn điểm đánh giá từ 1 đến 5.', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      await ReviewService.createReview(productId, rating, comment);
      displayNotification('Đánh giá đã được gửi!', 'success');
      const updatedReviews = await ReviewService.getReviewsByProductId(productId);
      setReviews(updatedReviews);
      calculateReviewStats(updatedReviews);
      const myReview = await ReviewService.getMyReviewForProduct(productId);
      setMyReview(myReview);
    } catch (err) {
      displayNotification(err?.response?.data?.message || 'Lỗi khi gửi đánh giá.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 text-gray-700 mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">PHẢN HỒI KHÁCH HÀNG</h3>
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Thống kê */}
        <div className="w-full md:w-1/2">
          {numberOfReviews > 0 ? (
            <div className="space-y-4">
              {Object.entries(ratingCounts)
                .sort(([starA], [starB]) => starB - starA)
                .map(([star, count]) => (
                  <div key={star} className="flex items-center">
                    <span className="flex items-center w-5 text-sm font-medium">{star}
                      <StarIcon/>
                    </span>
                    <div className="w-3/4 bg-gray-200 rounded-full h-5 mx-2">
                      <div
                        className="bg-light-green h-5 rounded-full"
                        style={{ width: `${(count / numberOfReviews) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">({count} đánh giá)</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Sản phẩm này chưa có đủ dữ liệu đánh giá để hiển thị biểu đồ.</p>
          )}
        </div>

        {/* Xếp hạng và Viết đánh giá */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-2">Xếp hạng {averageRating.toFixed(1)}/5.0</h4>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-8 h-8 ${
                    i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {/* Link tổng số đánh giá */}
            <a href="#all-reviews" className="text-sky-700 hover:underline mb-4 block">
              {numberOfReviews} đánh giá
            </a>
          </div>

          {/* Đánh giá */}
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Đánh giá của bạn
          </h3>
          <div id="review-form-section" className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            {user ? (
              myReview ? (
                <div className="">
                  <div className="flex items-center space-x-1 mb-1">
                    <p className='font-semibold'>Đánh giá:</p>
                    {[...Array(myReview.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600">{myReview.comment}</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitReview(); }} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="rating" className="text-sm font-medium text-gray-700">Đánh giá:</label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <StarIcon
                          key={value}
                          className={`h-8 w-8 cursor-pointer ${value <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          onClick={() => setRating(value)}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">
                      {rating ? `${rating} Sao` : 'Chọn số sao'}
                    </span>
                  </div>
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Bình luận:</label>
                    <textarea
                      id="comment"
                      name="comment"
                      rows="4"
                      className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm ${submittingReview ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Viết bình luận của bạn..."
                      disabled={submittingReview}
                    ></textarea>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-light-green hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? 'ĐANG GỬI' : 'GỬI ĐÁNH GIÁ'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              // Chưa đăng nhập
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center text-gray-600">
                Vui lòng đăng nhập để viết đánh giá của bạn.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danh sách đánh giá sản phẩm */}
      <h3 id="all-reviews" className="text-xl font-semibold mb-4 mt-8">TẤT CẢ ĐÁNH GIÁ ({numberOfReviews})</h3>
      {reviews.length === 0 ? (
        <p className="text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-t pt-6 first:border-t-0 first:pt-0 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{review.userId?.name || review.userName || 'Người dùng'}</div>
                <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-700 relative pl-6 italic">
                <span className="absolute left-0 top-0 text-3xl text-gray-300 -mt-2">"</span>
                {review.comment}
                <span className="absolute right-0 bottom-0 text-3xl text-gray-300 -mb-4">"</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReview;