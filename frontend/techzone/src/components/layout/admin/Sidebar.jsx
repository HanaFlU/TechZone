import React, { useContext, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';

import { LuChevronFirst, LuChevronLast } from "react-icons/lu";
import { FaYoutube } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BsPieChart } from "react-icons/bs";
import { BsPieChartFill } from "react-icons/bs";
import { LiaMoneyBillWaveAltSolid } from "react-icons/lia";
import { FaMoneyBill1Wave } from "react-icons/fa6";
import { FaRegUserCircle } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { IoStatsChartOutline } from "react-icons/io5";
import { IoStatsChartSharp } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { IoSettings } from "react-icons/io5";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { IoMdHelpCircle } from "react-icons/io";
import { RxDashboard } from "react-icons/rx";
import { MdDashboard } from "react-icons/md";
import { RiLogoutCircleRLine } from "react-icons/ri";

import MenuItem from './MenuItem';
import { AuthContext } from '../../../context/AuthContext';

const Sidebar = ({onVisitStore, children}) => {
    const [isOpen, setIsOpen] = useState(true);
    const toggleSideBar = () => setIsOpen(!isOpen);
    const { user } = useContext(AuthContext);
    const [openCatalogs, setOpenCatalogs] = useState(false);
    const [openUsers, setOpenUsers] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const items = [
        {
            label: 'Dashboard',
            icon1: <RxDashboard className='w-5 h-5' />,
            icon2: <MdDashboard className='w-5 h-5' />,
            notify: false,
            onClick: () => navigate('/admin/dashboard'),
            active: location.pathname === '/admin/dashboard'
        },
        {
            label: 'Catalogs',
            icon1: <IoStatsChartOutline className='w-5 h-5' />,
            icon2: <IoStatsChartSharp className='w-5 h-5' />,
            notify: false,
            onClick: () => setOpenCatalogs(!openCatalogs),
            active: ['/admin/products','/admin/category','/admin/spec'].includes(location.pathname),
            children: openCatalogs && (
              <div className="ml-6 mt-1 space-y-1">
                <div className="cursor-pointer hover:text-emerald-600" onClick={() => navigate('/admin/products')}>Product</div>
                <div className="cursor-pointer hover:text-emerald-600" onClick={() => navigate('/admin/category')}>Category</div>
                <div className="cursor-pointer hover:text-emerald-600" onClick={() => navigate('/admin/spec')}>Specification</div>
              </div>
            )
        },
        {
            label: 'Orders',
            icon1: <BsPieChart className='w-5 h-5' />,
            icon2: <BsPieChartFill className='w-5 h-5' />,
            notify: false,
            onClick: () => navigate('/admin/oders'),
            active: location.pathname === '/admin/oders'
        },
        {
            label: 'Users',
            icon1: <FaRegUserCircle className='w-5 h-5' />,
            icon2: <FaUserCircle className='w-5 h-5' />,
            notify: false,
            onClick: () => setOpenUsers(!openUsers),
            active: ['/admin/customers','/admin/staff'].includes(location.pathname),
            children: openUsers && (
                <div className="ml-6 mt-1 space-y-1">
                    <div className="cursor-pointer hover:text-emerald-600" onClick={() => navigate('/admin/customers')}>Customer</div>
                    <div className="cursor-pointer hover:text-emerald-600" onClick={() => navigate('/admin/staff')}>Staff</div>
                </div>
            )
        },
        {
            label: 'Settings',
            icon1: <IoSettingsOutline className='w-5 h-5' />,
            icon2: <IoSettings className='w-5 h-5' />,
            notify: false,
            outline: true,
            onClick: () => navigate('/admin/settings'),
            active: location.pathname === '/admin/settings'
        },
        {
            label: 'Help',
            icon1: <IoMdHelpCircleOutline className='w-5 h-5' />,
            icon2: <IoMdHelpCircle className='w-5 h-5' />,
            notify: false,
            onClick: () => navigate('/admin/help'),
            active: location.pathname === '/admin/help'
        }
    ]


  return (
    <section className='flex h-screen bg-gradient-to-br from-emerald-50 to-white'>

        {/* SideBar */}
        <nav className={`${isOpen ? "w-72" : "w-16"} transition-all duration-300 p-3 pb-[85px] bg-white border-r border-emerald-100 shadow-md relative `}>

            {/* SideBar Header */}
            <div className={`p-2 flex items-center  ${isOpen ? "justify-between" : "justify-center"}`}>
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
            <div className='mt-4 overflow-y-auto h-[calc(100vh-85px)]'>
            {items.map(({ label, icon1, icon2, notify, outline, onClick, children, active }) => (
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
            >
            {children}
            </MenuItem>
            ))}
            </div>

            {/* User Info & Logout */}
            <div className="absolute left-0 bottom-0 w-full border-t border-emerald-100 bg-white pt-5 group zindex-100">
                <div className="flex items-center justify-between p-2 rounded zindex-10">
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
                        <RiLogoutCircleRLine onClick={onVisitStore} className='w-12 h-6 text-dark-green cursor-pointer'/>
                    )}
                </div>
                {!isOpen && (
                    <span className="absolute left-14 top-1/2 transform -translate-y-1/2 scale-0 group-hover:scale-100 transition bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded">
                        {user.name}
                    </span>
                )}
            </div>
        </nav>

        {/* Main Content */}
        <div className='flex-1 p-6 bg-emerald-50 rounded-lg shadow-inner overflow-auto'>
          {children}
        </div>
      </section>
  )
}

export default Sidebar