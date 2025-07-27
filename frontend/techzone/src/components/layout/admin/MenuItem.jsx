import React from 'react';
// Loại bỏ import LuChevronDown, LuChevronRight vì không còn chevron
// import { LuChevronDown, LuChevronRight } from 'react-icons/lu';

const MenuItem = ({ icon, icon2, label, active, isOpen, onClick, notify, outline }) => { // Loại bỏ children và isExpanded
    // Loại bỏ các biến không cần thiết
    // const hasChildren = children && React.Children.count(children) > 0;
    // const isExpanded = hasChildren && children; // Không còn isExpanded prop từ Sidebar

    return (
        <div className={`relative group ${outline ? "border-t border-gray-300 pt-2" : ""}`}>
            <div
                onClick={onClick}
                className={`flex items-center justify-between hover:bg-emerald-100 p-2 rounded cursor-pointer my-2 ${active ? "bg-emerald-100" : ""}`}
            >
                <div className='flex items-center space-x-2 relative'>
                    {active ? <span className='text-emerald-600'>{icon}</span> : icon2}
                    {isOpen && <span className={`text-base ${active ? "font-semibold text-emerald-600" : "text-gray-700"}`}>{label}</span>}
                    {/* Notification dot for collapsed state */}
                    {!isOpen && notify && <div className='absolute top-0 right-2 w-2 h-2 rounded-full bg-emerald-600'></div>}
                </div>
                {/* Notification dot for expanded state (if applicable, currently not used) */}
                {isOpen && notify && <div className='w-2 h-2 rounded-full bg-emerald-600'></div>}
                
                {/* Loại bỏ logic chevron icon */}
                {/* {isOpen && hasChildren && (
                    <span className={`text-emerald-600 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                        <LuChevronRight className='w-5 h-5' />
                    </span>
                )} */}
            </div>

            {/* Loại bỏ phần xử lý submenu items với collapse/expand transition */}
            {/* <div
                className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}
                `}
            >
                {isExpanded && children && (
                    <div className="pl-8 py-1">
                        {children}
                    </div>
                )}
            </div> */}

            {/* Tooltip for collapsed state (unchanged) */}
            {!isOpen && (
                <span className="absolute left-14 top-1/2 transform -translate-y-1/2 scale-0 group-hover:scale-100 transition bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded whitespace-nowrap">
                    {label}
                </span>
            )}
        </div>
    );
};

export default MenuItem;