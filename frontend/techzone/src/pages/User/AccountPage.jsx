import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerService from '../../services/CustomerService';
import Input from '../../components/Input/Input';
import Select from '../../components/Input/Select';
import Button from '../../components/button/Button';
import Notification from '../../components/button/Notification';
import {
  UserCircleIcon,
  MapPinIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

const AccountPage = () => {
  const navigate = useNavigate();
  // Lấy userId từ localStorage
  const [currentUserId, setCurrentUserId] = useState(null);

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notificationType, setNotificationType] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthdate: '',
    gender: ''
  });

  // Lấy userId
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user._id) {
          setCurrentUserId(user._id);
        } else {
          console.error("User ID not found in localStorage.");
          setLoading(false);
          setError("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.");
          // navigate('/login');
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        setLoading(false);
        setError("Lỗi khi đọc thông tin người dùng. Vui lòng thử lại.");
      }
    } else {
      console.error("No user found in localStorage. Redirecting to login.");
      setLoading(false);
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem thông tin.");
      // navigate('/login');
    }
}, [navigate]);
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await CustomerService.getAccountInfo(currentUserId);

        if (data.success && data.user) {
          setUserProfile(data.user);
          setFormData({
            name: data.user.name || '',
            phone: data.user.phone || '',
            email: data.user.email || '',
            birthdate: data.user.birthdate ? new Date(data.user.birthdate).toISOString().split('T')[0] : '',
            gender: data.user.gender || ''
          });
        } else {
          setError(data.message || 'Không thể lấy hồ sơ người dùng.');
        }
      } catch (err) {
        console.error("Lỗi khi lấy hồ sơ người dùng:", err);
        setError(err.message || 'Đã xảy ra lỗi khi tải hồ sơ.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUserId]);

  const showNotification = (message, type) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotificationMessage(null);
      setNotificationType(null);
    }, 3000);
  };

  const closeNotification = () => {
    setNotificationMessage(null);
    setNotificationType(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setNotificationMessage(null);
    setNotificationType(null);

    try {
      if (!currentUserId) {
        throw new Error("Không tìm thấy User ID. Vui lòng đăng nhập.");
      }
      const dataToSend = {
        name: formData.name,
        phone: formData.phone,
        birthdate: formData.birthdate ? new Date(formData.birthdate).toISOString() : null, // Gửi null nếu rỗng
        gender: formData.gender,
      };

      console.log("Dữ liệu gửi đi:", dataToSend);

      const data = await CustomerService.updateAccountInfo(currentUserId, dataToSend);

      if (data.success && data.user) {
        setUserProfile(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          email: data.user.email || '',
          birthdate: data.user.birthdate ? new Date(data.user.birthdate).toISOString().split('T')[0] : '',
          gender: data.user.gender || ''
        });
        showNotification('Cập nhật hồ sơ thành công!', 'success');
      } else {
        throw new Error(data.message || 'Không thể cập nhật hồ sơ.');
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ:", err);
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật.');
      showNotification('Cập nhật hồ sơ thất bại: ' + (err.message || 'Lỗi không xác định'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      email: userProfile?.email || '',
      birthdate: userProfile?.birthdate ? new Date(userProfile.birthdate).toISOString().split('T')[0] : '',
      gender: userProfile?.gender || ''
    });
    setNotificationMessage(null);
    setNotificationType(null);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-700">Đang tải hồ sơ...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-4 font-sans grid grid-cols-1 lg:grid-cols-4 gap-5">
      <Notification
        message={notificationMessage}
        type={notificationType}
        onClose={closeNotification}
      />

      {/* Left side */}
      <div className="lg:col-span-1 bg-white p-6 rounded-lg h-fit">
        <div className="flex items-center mb-6 border-b pb-4 border-gray-200">
          <UserCircleIcon className="h-10 w-10 text-gray-500 mr-3" />
          <div>
            <p className="font-semibold text-lg text-gray-800">{userProfile?.name || 'Người dùng'}</p>
            <p className="text-sm text-gray-500">{userProfile?.email}</p>
          </div>
        </div>
        <nav className="space-y-2">
          <a href="#" className="flex items-center p-3 rounded-md text-dark-green bg-emerald-50 font-medium">
            <UserCircleIcon className="h-5 w-5 mr-3" />
            Tài khoản của tôi
          </a>
          <a href="#" onClick={() => navigate('/addresses')} className="flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100">
            <MapPinIcon className="h-5 w-5 mr-3" />
            Địa chỉ giao hàng
          </a>
          <a href="#" onClick={() => navigate('/orders')} className="flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100">
            <CubeIcon className="h-5 w-5 mr-3" />
            Đơn hàng của tôi
          </a>
        </nav>
      </div>

      {/* Right side */}
      <div className="lg:col-span-3 bg-white p-8 pt-4 rounded-lg">
        <h2 className="text-2xl text-gray-800 font-bold mb-4">Hồ sơ của tôi</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
          <Input
            label="Họ tên"
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Số điện thoại"
            id="phone"
            name="phone"
            type="text"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Ngày sinh"
            id="birthdate"
            name="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={handleInputChange}
            required
          />
          <Select
            label="Giới tính:"
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'Chọn giới tính' },
              { value: 'MALE', label: 'Nam' },
              { value: 'FEMALE', label: 'Nữ' },
              { value: 'OTHER', label: 'Khác' },
            ]}
            required
          />
          <div className='md:col-span-2'>
            <Input
              label="Email"
              id="email"
              name="email"
              type="text"
              readOnly
              value={formData.email}
            />
          </div>
          <div className="md:col-span-1 flex justify-start items-start">
            <p
              onClick={() => alert('Chức năng thay đổi mật khẩu sẽ được phát triển!')}
              className="text-light-green hover:underline text-sm font-medium cursor-pointer"
            >
              Thay đổi mật khẩu
            </p>
          </div>
          <div className="md:col-span-1 flex justify-end space-x-4">
            <Button
              onClick={handleCancelEdit}
              variant="outline"
            >
              HỦY
            </Button>
            <Button
              onClick={handleSaveProfile}
              variant="primary"
            >
              LƯU
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;