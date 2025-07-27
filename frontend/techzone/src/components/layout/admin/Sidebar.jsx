import React, { useContext, useState, useEffect } from 'react'; // Giữ lại useEffect nếu bạn muốn làm gì đó khác
import { useNavigate, useLocation } from 'react-router-dom';

import { LuChevronFirst, LuChevronLast } from "react-icons/lu";
import { FaRegUserCircle, FaUserCircle } from "react-icons/fa";
import { MdOutlineSpaceDashboard, MdSpaceDashboard, MdOutlineCategory, MdCategory, MdPayments, MdOutlinePayments } from "react-icons/md";
import { FaUserTie } from "react-icons/fa6";
import { AiFillProduct, AiOutlineProduct } from "react-icons/ai";
import { IoTicketOutline, IoTicketSharp } from "react-icons/io5";
import { RiLogoutCircleRLine } from 'react-icons/ri';

import MenuItem from './MenuItem';
import { AuthContext } from '../../../context/AuthContext';
import { LiaUserTieSolid } from 'react-icons/lia';

const Sidebar = ({onVisitStore, children}) => {
    const [isOpen, setIsOpen] = useState(true);
    const toggleSideBar = () => setIsOpen(!isOpen);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const items = [
        {
            label: 'Dashboard',
            icon1: <MdOutlineSpaceDashboard  className='w-5 h-5' />,
            icon2: <MdSpaceDashboard className='w-5 h-5' />,
            notify: false,
            onClick: () => navigate('/admin/dashboard'),
            active: location.pathname === '/admin/dashboard'
        },
        {
            label: 'Products',
            icon1: <AiOutlineProduct className='w-5 h-5' />,
            icon2: <AiFillProduct className='w-5 h-5' />, 
            notify: false,
            onClick: () => navigate('/admin/products'),
            active: location.pathname === '/admin/products'
        },
        {
            label: 'Categories',
            icon1: <MdOutlineCategory className='w-5 h-5' />, 
            icon2: <MdCategory className='w-5 h-5' />,
            notify: false,
            onClick: () => navigate('/admin/category'),
            active: location.pathname === '/admin/category'
        },
        {
            label: 'Vouchers',
            icon1: <IoTicketOutline className='w-5 h-5' />, 
            icon2: <IoTicketSharp className='w-5 h-5' />, 
            notify: false,
            onClick: () => navigate('/admin/vouchers'),
            active: location.pathname === '/admin/vouchers'
        },
        {
            label: 'Orders',
            icon1: <MdOutlinePayments className='w-5 h-5' />,
            icon2: <MdPayments className='w-5 h-5' />,
            notify: false,
            onClick: () => navigate('/admin/orders'),
            active: location.pathname === '/admin/orders'
        },
        {
            label: 'Customers',
            icon1: <FaRegUserCircle className='w-5 h-5' />,
            icon2: <FaUserCircle className='w-5 h-5' />,  
            notify: false,
            onClick: () => navigate('/admin/customers'),
            active: location.pathname === '/admin/customers'
        },
        {
            label: 'Staff',
            icon1: <LiaUserTieSolid className='w-5 h-5' />,
            icon2: <FaUserTie className='w-5 h-5' />,
            notify: false,
            onClick: () => navigate('/admin/staff'),
            active: location.pathname === '/admin/staff'
        },
       
    ]

    return (
<section className='flex h-screen bg-gradient-to-br from-emerald-50 to-white'>

            {/* Backdrop for mobile when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={toggleSideBar}
                ></div>
            )}

            {/* SideBar */}
            <nav
                className={`
                    ${isOpen ? "w-72" : "w-16"}
                    transition-all duration-300 p-3 bg-white border-r border-emerald-100 shadow-md
                    md:relative md:translate-x-0
                    ${!isOpen ? "md:w-16" : "md:w-72"}
                    fixed inset-y-0 left-0 z-50 max-w-[288px]
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    h-full flex flex-col // Thêm h-full, flex, flex-col
                `}
            >

                {/* SideBar Header */}
                <div className={`p-2 flex items-center ${isOpen ? "justify-between" : "justify-center"}`}>
                    {isOpen && (
                        <a href="/" className='flex items-center space-x-2'>
                            <img src="/LogoSingle.png" alt="logo" className='h-12 w-auto drop-shadow' />
                            <span className='text-xl font-bold text-emerald-700 tracking-wide'>TECHZONE</span>
                        </a>
                    )}
                    <button onClick={toggleSideBar} className="ml-2 text-emerald-600 hover:bg-emerald-100 rounded-full p-1">
                        {isOpen ? <LuChevronFirst className='w-6 h-6' /> : <LuChevronLast className='w-6 h-6' />}
                    </button>
                </div>

                {/* SideBar Menu Items */}
                <div className='overflow-y-auto flex-grow'> {/* Loại bỏ h-[calc(...)], thêm flex-grow */}
                {items.map(({ label, icon1, icon2, notify, outline, onClick, active }) => (
                <MenuItem
                    key={label}
                    icon={icon2}
                    icon2={icon1}
                    label={label}
                    isOpen={isOpen}
                    active={active}
                    onClick={onClick}
                    notify={notify}
                    outline={outline}
                />
                ))}
                </div>

                {/* User Info & Logout */}
                <div className="w-full border-t border-emerald-100 bg-white pt-5 group z-20 mt-auto"> {/* Loại bỏ absolute, thêm mt-auto */}
                    <div className="flex items-center justify-between p-2 rounded z-10">
                        <div className='flex items-center space-x-3 relative'>
                            <div className='bg-emerald-100 h-10 w-10 flex items-center justify-center rounded-lg text-xl font-bold text-emerald-600'>
                                {user.name ? user.name[0].toUpperCase() : 'A'}
                            </div>
                            {isOpen && (
                                <div>
                                    <span className='block font-semibold text-emerald-700'>{user.name}</span>
                                    <span className='text-xs text-gray-600'>{user.email}</span>
                                </div>
                            )}
                        </div>
                        {isOpen && (
                            <RiLogoutCircleRLine onClick={onVisitStore} className='w-12 h-6 text-emerald-600 cursor-pointer'/>
                        )}
                    </div>
                    {!isOpen && (
                        <span className="absolute left-14 top-1/2 transform -translate-y-1/2 scale-0 group-hover:scale-100 transition bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded whitespace-nowrap">
                            {user.name}
                        </span>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className={`flex-1 p-6 bg-emerald-50 rounded-lg shadow-inner overflow-auto transition-all duration-300`}>
              {children}
            </div>
          </section>
      )
}

export default Sidebar;