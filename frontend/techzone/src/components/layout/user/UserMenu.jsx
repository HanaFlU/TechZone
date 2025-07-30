import React, { useContext, useEffect, useRef, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserMenu = ({onClick, setAdminMode}) => {
    const { user, logout } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();
    const navigate = useNavigate();
    
    useEffect(() => {
        const handleClickOutside = (e) => {
          if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setOpen(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [user]);
    
    if (!user) {
        return (
          <div className='flex items-center cursor-pointer gap-2 px-3 py-2 rounded hover:bg-emerald-800 hover:rounded-lg' onClick={onClick}>
              <CgProfile className="w-6 h-6"/>
              <div>Tài Khoản</div>
          </div>
        )
      }

    return (
        <div className="relative ref={dropdownRef}">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center cursor-pointer gap-2 px-3 py-2 rounded hover:bg-emerald-800 hover:rounded-lg transition"
            >
                <CgProfile className="w-6 h-6 text-white transition" />
                <span className="text-sm font-medium">{user.name || user.email}</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 z-10 mt-2 w-44 bg-white text-dark-green shadow-lg rounded-lg transition-all duration-200">
                    <a
                        href="/account"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-t"
                    >
                    Tài khoản
                    </a>
                    
                    {(user?.role === "AD" || user?.role === "MANAGER" || user?.role === "STAFF") && (
                        <a
                            className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-t"
                            onClick={e => {
                                e.preventDefault();
                                setAdminMode(true);
                                navigate("/admin/dashboard");
                                }
                            }
                        >
                            Quản lý
                        </a>
                    )}
                    <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-b"
                    >
                    Đăng xuất
                    </button>
                </div>
            )}
        </div>
      );
}

export default UserMenu