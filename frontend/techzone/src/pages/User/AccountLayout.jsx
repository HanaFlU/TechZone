import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import CustomerService from '../../services/CustomerService';
import {
  UserCircleIcon,
  MapPinIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

import useAuthUser from '../../hooks/useAuthUser';

const AccountLayout = () => {
  const { currentUserId, authError, isAuthLoading } = useAuthUser();
  const [userProfile, setUserProfile] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loadingAccountData, setLoadingAccountData] = useState(true);
  const [accountDataError, setAccountDataError] = useState(null);

  const fetchAccountData = useCallback(async () => {
    if (!currentUserId) {
      setAccountDataError("Không có ID người dùng để tải thông tin tài khoản.");
      setLoadingAccountData(false);
      return;
    }
    setLoadingAccountData(true);
    setAccountDataError(null);
    try {
      const profileResponse = await CustomerService.getAccountInfo(currentUserId);
      if (profileResponse.success && profileResponse.user) {
        setUserProfile(profileResponse.user);
      } else {
        throw new Error(profileResponse.message || "Không thể tải thông tin hồ sơ.");
      }

      const customerResponse = await CustomerService.getCustomerByUserId(currentUserId);
      if (customerResponse.success && customerResponse.customer) {
        setCustomerInfo(customerResponse.customer);
      } else {
        throw new Error(customerResponse.message || "Không thể tải thông tin khách hàng.");
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu tài khoản:", err);
      setAccountDataError(err.message || "Lỗi không xác định khi tải dữ liệu tài khoản.");
    } finally {
      setLoadingAccountData(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      fetchAccountData();
    }
  }, [currentUserId, fetchAccountData]);

  if (isAuthLoading || loadingAccountData) {
    return <div className="p-8 text-center text-gray-700">Đang tải thông tin tài khoản...</div>;
  }
  if (authError || accountDataError) {
    return <div className="p-8 text-center text-red-600">Lỗi: {authError || accountDataError}</div>;
  }

  const actualCustomerId = customerInfo?._id || null;
  return (
    <div className="container mx-auto px-8 py-8 pt-2 font-sans">
    <Breadcrumb items={[{ label: "Tài khoản" }]} />
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
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
                isActive ? 'text-emerald-700 bg-emerald-50 font-medium' : ''
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
                isActive ? 'text-emerald-700 bg-emerald-50 font-medium' : ''
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
                isActive ? 'text-emerald-700 bg-emerald-50 font-medium' : ''
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
        <Outlet context={{ currentUserId, userProfile, customerId: actualCustomerId, setUserProfile: fetchAccountData }} />
      </div>
    </div>
    </div>
  );
};

export default AccountLayout;