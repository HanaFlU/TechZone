import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import CustomerService from '../../services/CustomerService';
import Input from '../../components/Input/Input';
import Button from '../../components/button/Button';
import Notification from '../../components/button/Notification';
import { HomeIcon } from '@heroicons/react/24/outline';
import AddressSelect from '../../components/Input/AddressSelect';
import zipCodesData from '../../data/hanhchinhvn/zip_code.json';

const AddressForm = () => {
  const { customerId } = useOutletContext();
  const { id: addressId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    district: '',
    ward: '',
    zipcode: '',
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notificationType, setNotificationType] = useState(null);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (addressId) {
      setIsEditMode(true);
      const fetchAddress = async () => {
        setLoading(true);
        try {
          const response = await CustomerService.getAddressById(addressId);
          const address = response.address;
          if (address) {
            setFormData({
              fullName: address.fullName,
              phone: address.phone,
              street: address.street,
              city: address.city,
              district: address.district,
              ward: address.ward,
              zipcode: address.zipcode,
              isDefault: address.isDefault,
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Không thể tải thông tin địa chỉ.');
        } finally {
          setLoading(false);
        }
      };
      fetchAddress();
    }
  }, [addressId]);

  useEffect(() => {
    if (formData.city) {
      const foundCity = zipCodesData.find(item => {
        return formData.city.toLowerCase() === item.province.toLowerCase();
      });
      if (foundCity && foundCity.zipCode) {
        const zipCodeToUse = foundCity.zipCode.split(' ')[0];
        setFormData(prevData => ({
          ...prevData,
          zipcode: zipCodeToUse
        }));
      } else {
        setFormData(prevData => ({
          ...prevData,
          zipcode: ''
        }));
      }
    } else {
      setFormData(prevData => ({
        ...prevData,
        zipcode: ''
      }));
    }
  }, [formData.city]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prevData => {
      const newState = {
        ...prevData,
        [field]: value
      };
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!customerId) {
      showNotification('Không tìm thấy Customer ID. Vui lòng đăng nhập.', 'error');
      setLoading(false);
      return;
    }
    const successMessage = isEditMode ? 'Cập nhật địa chỉ thành công!' : 'Lưu địa chỉ thành công!';
    const failureMessage = isEditMode ? 'Cập nhật địa chỉ thất bại.' : 'Lưu địa chỉ thất bại.';

    try {
      let response;
      if (isEditMode) {
        response = await CustomerService.updateAddress(addressId, formData);
      } else {
        response = await CustomerService.addAddress(customerId, formData);
      }

      if (response.success) {
        showNotification(successMessage, 'success');
        setTimeout(() => {
          navigate('/account/addresses');
      }, 2000);
      } else {
        showNotification(failureMessage, 'error');
      }
    } catch (err) {
      console.error("Lỗi khi lưu địa chỉ:", err);
      showNotification('Lỗi server: ' + (error.response?.data?.message || error.message || 'Không thể xử lý yêu cầu.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditMode && !addressId) {
    return <div className="text-center py-10">Đang tải form địa chỉ...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditMode ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
      </h2>
      <Notification
        message={notificationMessage}
        type={notificationType}
        onClose={closeNotification}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
        <Input
          label="Họ và tên"
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Nhập họ tên người nhận"
          required
        />
        <Input
          label="Số điện thoại"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          type="tel"
          placeholder="Nhập số điện thoại"
          required
        />
        <Input
          label="Địa chỉ nhà"
          id="street"
          name="street"
          type="text"
          value={formData.street}
          onChange={handleChange}
          placeholder="Số nhà, tên đường,..."
          required
        />
        <AddressSelect
          selectedCity={formData.city}
          selectedDistrict={formData.district}
          selectedWard={formData.ward}
          onCityChange={(value) => handleAddressChange('city', value)}
          onDistrictChange={(value) => handleAddressChange('district', value)}
          onWardChange={(value) => handleAddressChange('ward', value)}
        />

        <div className="md:col-span-1 flex justify-start items-start">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label htmlFor="isDefault" className="ml-2 block text-sm font-medium text-gray-700">
              Đặt làm địa chỉ mặc định
          </label>
        </div>
        <div className="md:col-span-1 flex justify-end space-x-4">

        <Button
            onClick={() => navigate('/account/addresses')}
            variant="outline"
          >
            HỦY
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : (isEditMode ? 'CẬP NHẬT' : 'LƯU')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddressForm;