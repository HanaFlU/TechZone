import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import CustomerService from '../../services/CustomerService';
import {
  UserCircleIcon,
  MapPinIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

const AccountLayout = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);

  // Lấy userId từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user._id) {
          setCurrentUserId(user._id);
        } else {
          console.error("User ID not found in localStorage.");
          setErrorProfile("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.");
          setLoadingProfile(false);
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        setErrorProfile("Lỗi khi đọc thông tin người dùng. Vui lòng thử lại.");
        setLoadingProfile(false);
      }
    } else {
      console.error("No user found in localStorage.");
      setErrorProfile("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem thông tin.");
      setLoadingProfile(false);
    }
  }, [navigate]);

    useEffect(() => {
        const fetchAccountData = async () => {
        if (!currentUserId) {
            return; 
        }

        setLoadingProfile(true);
        setErrorProfile(null);
        try {

            const userInfoResponse = await CustomerService.getAccountInfo(currentUserId);
            if (userInfoResponse.success && userInfoResponse.user) {
            setUserProfile(userInfoResponse.user);
            } else {
            throw new Error(userInfoResponse.message || 'Không thể lấy hồ sơ người dùng.');
            }
            // Lấy customerId bằng userId
            const customerResponse = await CustomerService.getCustomerByUserId(currentUserId);
            if (customerResponse.success && customerResponse.customer) {
                setCustomerInfo(customerResponse.customer);
            } else {
                throw new Error(customerResponse.message || 'Không thể lấy thông tin khách hàng liên kết.');
            }

        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu tài khoản:", err);
            setErrorProfile(err.message || 'Đã xảy ra lỗi khi tải hồ sơ.');
        } finally {
            setLoadingProfile(false);
        }
        };

        fetchAccountData();
    }, [currentUserId]);

    const actualCustomerId = customerInfo?._id || null;

    if (loadingProfile) {
        return <div className="p-8 text-center text-gray-700">Đang tải thông tin tài khoản...</div>;
    }

    if (errorProfile) {
        return <div className="p-8 text-center text-red-600">Lỗi: {errorProfile}</div>;
    }

    return (
        <div className="container mx-auto h-fit py-8 pt-4 font-sans grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left side (Sidebar) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg h-fit">
            <div className="flex items-center mb-6 border-b pb-4 border-gray-200">
            <UserCircleIcon className="h-10 w-10 text-gray-500 mr-3" />
            <div>
                <p className="font-semibold text-lg text-gray-800">{userProfile?.name || 'Người dùng'}</p>
                <p className="text-sm text-gray-500">{userProfile?.email}</p>
            </div>
            </div>
            <nav className="space-y-2">
            <NavLink
                to="/account"
                end
                className={({ isActive }) =>
                `flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100 ${
                    isActive ? 'text-dark-green bg-emerald-50 font-medium' : ''
                }`
                }
            >
                <UserCircleIcon className="h-5 w-5 mr-3" />
                Tài khoản của tôi
            </NavLink>
            <NavLink
                to="/account/addresses"
                className={({ isActive }) =>
                `flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100 ${
                    isActive ? 'text-dark-green bg-emerald-50 font-medium' : ''
                }`
                }
            >
                <MapPinIcon className="h-5 w-5 mr-3" />
                Địa chỉ giao hàng
            </NavLink>
            <NavLink
                to="/account/orders"
                className={({ isActive }) =>
                `flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100 ${
                    isActive ? 'text-dark-green bg-emerald-50 font-medium' : ''
                }`
                }
            >
                <CubeIcon className="h-5 w-5 mr-3" />
                Đơn hàng của tôi
            </NavLink>
            </nav>
        </div>

        {/* Right side */}
        <div className="lg:col-span-3 bg-white p-8 pt-4 rounded-lg">
            <Outlet context={{ currentUserId, userProfile, customerId: actualCustomerId }} />
        </div>
        </div>
    );
};

export default AccountLayout;