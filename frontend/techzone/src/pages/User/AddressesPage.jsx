import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import CustomerService from '../../services/CustomerService';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import Button from '../../components/button/Button';

const AddressesPage = () => {
  const navigate = useNavigate();
  const { customerId } = useOutletContext(); 

  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!customerId) {
        setError({ message: "Không tìm thấy Customer ID." });
        setLoading(false);
        return;
      }
      const response = await CustomerService.getAddresses(customerId);

      if (response.customer && response.customer.shippingAddresses) {
        const sortAddresses = [...response.customer.shippingAddresses].sort((a, b) => {
            if (a.isDefault && !b.isDefault) {
                return -1;
            }
            if (!a.isDefault && b.isDefault) {
                return 1;
            }
            return 0;
        });
        
        setCustomerAddresses(sortAddresses);
      } else {
        setCustomerAddresses([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải địa chỉ:", err);
      setError(err.response?.data || { message: "Không thể tải danh sách địa chỉ." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [customerId]);

  const handleDeleteAddress = async (addressIdToDelete) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này không?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await CustomerService.deleteAddress(customerId, addressIdToDelete);
      if (response.success) {
        await fetchAddresses();
      } else {
        alert(response.message || "Xóa địa chỉ thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
      alert("Đã có lỗi xảy ra khi xóa địa chỉ.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải địa chỉ...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-10">
        <h2 className="text-xl font-bold mb-4">Lỗi tải địa chỉ!</h2>
        <p>{error.message || "Đã có lỗi xảy ra khi lấy danh sách địa chỉ của bạn."}</p>
        <Button onClick={() => navigate('/')} variant="primary" className="mt-4">
          Quay lại trang chủ
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Địa chỉ giao hàng của tôi</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-dark-gray text-sm">
        {customerAddresses.length > 0 ? (
          customerAddresses.map((address) => (
            <div
              key={address._id}
              className={`block border rounded-lg p-4 transition-all relative
                ${address.isDefault ? 'border-2 border-light-green shadow-lg' : 'border-gray-300 hover:shadow-md'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-base">
                  {address.fullName} {address.isDefault && <span className="text-xs text-secondary">(Mặc định)</span>}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/account/addresses/edit/${address._id}`)}
                    className="text-gray-500 hover:text-emerald-700"
                    title="Chỉnh sửa địa chỉ"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="text-gray-500 hover:text-red-500"
                    title="Xóa địa chỉ"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p><span className='font-medium'>Số điện thoại:</span> {address.phone}</p>
              <p><span className='font-medium'>Địa chỉ:</span> {address.street}, {address.ward}, {address.district}, {address.city}</p>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 text-center text-gray-500 p-4 border rounded-md border-gray-300 bg-gray-50">
            <p className="text-lg mb-4">Bạn chưa có địa chỉ nào được lưu.</p>
          </div>
        )}

        {/* Nút Thêm địa chỉ */}
        <div
          onClick={() => navigate('/account/addresses/add')}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 cursor-pointer hover:border-emerald-700 hover:text-emerald-700 transition-colors"
        >
          <PlusIcon className="h-8 w-8 mb-2" />
          <span className="text-base font-medium">Thêm địa chỉ mới</span>
        </div>
      </div>
    </>
  );
};

export default AddressesPage;