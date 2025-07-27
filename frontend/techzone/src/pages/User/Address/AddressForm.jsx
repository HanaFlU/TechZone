import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import CustomerService from '../../../services/CustomerService';
import Input from '../../../components/Input/Input';
import Button from '../../../components/button/Button';
import NotificationContainer from '../../../components/button/NotificationContainer';
import AddressSelect from '../../../components/Input/AddressSelect';
import zipCodesData from '../../../data/hanhchinhvn/zip_code.json';
import useNotification from '../../../hooks/useNotification';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AddressForm = ({
  isOpen = false,
  onClose,
  onSaveSuccess,
  initialAddressData,
  customerId: propCustomerId
}) => {
  // Lấy customerId từ context
  const { customerId: contextCustomerId } = useOutletContext?.() || {};
  const { id: paramAddressId } = useParams?.() || {};
  const navigate = useNavigate?.() || (() => {});
  const customerId = propCustomerId || contextCustomerId;
  const addressId = initialAddressData?._id || paramAddressId;

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
  const {
    notifications,
    displayNotification, 
    closeNotification
  } = useNotification();
  const [isEditMode, setIsEditMode] = useState(false);

  // Load dữ liệu khi edit
  useEffect(() => {
    if (addressId && (isOpen || !onClose)) {
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
          displayNotification('Lỗi khi tải thông tin địa chỉ: ' + (err.response?.data?.message || 'Lỗi không xác định'), 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchAddress();
    } else if (!addressId && (isOpen || !onClose)) {
      setIsEditMode(false);
      setFormData({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        district: '',
        ward: '',
        zipcode: '',
        isDefault: false,
      });
    }
  }, [addressId, isOpen, displayNotification, onClose]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const phoneRegex = /^(0|\+84|84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      displayNotification('Sai định dạng số điện thoại', 'error');
      setLoading(false);
      return;
    }

    if (!customerId) {
      displayNotification('Không tìm thấy Customer ID. Vui lòng đăng nhập.', 'error');
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
        displayNotification(successMessage, 'success');
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        setTimeout(() => {
          if (onClose) onClose();
          else navigate('/account/addresses');
        }, 1500);
      } else {
        displayNotification(failureMessage, 'error');
      }
    } catch (err) {
      displayNotification('Lỗi server: ' + (err.response?.data?.message || err.message || 'Không thể xử lý yêu cầu.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Nếu là modal và chưa mở
  if (isOpen && onClose && !isOpen) return null;

  // Nếu là modal
  if (isOpen && onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 sm:p-8 md:p-10 z-50 overflow-y-auto max-h-[90vh]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Đóng"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          {renderForm()}
        </div>
      </div>
    );
  }
  return renderForm();

  function renderForm() {
    return (
      <form onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditMode ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        </h2>
        <NotificationContainer
          notifications={notifications}
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
            type="text"
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
                onClick={onClose ? onClose : () => navigate('/account/addresses')}
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
  }
};

export default AddressForm;