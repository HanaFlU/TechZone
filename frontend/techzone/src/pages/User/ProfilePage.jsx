import React, { useState, useEffect } from 'react';
import {useOutletContext } from 'react-router-dom';
import CustomerService from '../../services/CustomerService';
import Input from '../../components/Input/Input';
import Select from '../../components/Input/Select';
import Button from '../../components/button/Button';
import Notification from '../../components/button/Notification';
import useNotification from '../../hooks/useNotification';
import UserService from '../../services/UserService';

const ProfilePage = () => {
  const { currentUserId, userProfile: initialUserProfile } = useOutletContext(); 

  const [userProfile, setUserProfile] = useState(initialUserProfile);
  const {
    notificationMessage, 
    notificationType, 
    showNotification, 
    displayNotification, 
    closeNotification
  } = useNotification();
  const [formData, setFormData] = useState({
    name: initialUserProfile?.name || '',
    phone: initialUserProfile?.phone || '',
    email: initialUserProfile?.email || '',
    birthdate: initialUserProfile?.birthdate ? new Date(initialUserProfile.birthdate).toISOString().split('T')[0] : '',
    gender: initialUserProfile?.gender || ''
  });

  // Lấy userId
  useEffect(() => {
    if (initialUserProfile) {
      setUserProfile(initialUserProfile);
      setFormData({
        name: initialUserProfile.name || '',
        phone: initialUserProfile.phone || '',
        email: initialUserProfile.email || '',
        birthdate: initialUserProfile.birthdate ? new Date(initialUserProfile.birthdate).toISOString().split('T')[0] : '',
        gender: initialUserProfile.gender || ''
      });
    }
  }, [initialUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    displayNotification('', '');

    try {
      if (!currentUserId) {
        throw new Error("Không tìm thấy User ID. Vui lòng đăng nhập.");
      }
      const dataToSend = {
        name: formData.name,
        phone: formData.phone,
        birthdate: formData.birthdate ? new Date(formData.birthdate).toISOString() : null,
        gender: formData.gender,
      };

      console.log("Dữ liệu gửi đi (updateAccountInfo):", dataToSend);

      const data = await UserService.updateAccountInfo(currentUserId, dataToSend);

      if (data.success && data.user) {
        setUserProfile(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          email: data.user.email || '',
          birthdate: data.user.birthdate ? new Date(data.user.birthdate).toISOString().split('T')[0] : '',
          gender: data.user.gender || ''
        });
        displayNotification('Cập nhật hồ sơ thành công!', 'success');
      } else {
        throw new Error(data.message || 'Không thể cập nhật hồ sơ.');
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ:", err);
      displayNotification('Cập nhật hồ sơ thất bại: ' + (err.message || 'Lỗi không xác định'), 'error');
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
    displayNotification('', '');
  };

  return (
    <>
      {showNotification && (
        <Notification
            message={notificationMessage}
            type={notificationType}
            onClose={closeNotification}
        />
      )}
      <h2 className="text-2xl text-gray-800 font-bold mb-4">Hồ sơ của tôi</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2 text-base">
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
    </>
  );
};

export default ProfilePage;