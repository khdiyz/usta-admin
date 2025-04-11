// src/components/Sidebar.jsx (mavjud kodga qo'shimcha)
import React, { useState, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaUsers, FaSignOutAlt, FaGlobe, FaMapMarkedAlt, FaMapMarkerAlt, FaTags, FaCog, FaUserAlt, FaUser, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const { logout } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar ochish/yopish funksiyasi
  const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), []);
  
  // Menu ochish/yopish funksiyasi
  const toggleMenu = useCallback((menuName) => {
    if (!isOpen) {
      setIsOpen(true);
      setExpandedMenu(menuName);
    } else {
      setExpandedMenu(prev => prev === menuName ? null : menuName);
    }
  }, [isOpen]);

  // Avtomatik menu ochish (agar foydalanuvchi shu bo'limda bo'lsa)
  React.useEffect(() => {
    if (location.pathname.includes('/masters') || location.pathname.includes('/clients')) {
      setExpandedMenu('users');
    }
  }, [location.pathname]);

  // Chiqish funksiyasi
  const handleLogout = useCallback(() => {
    showModal({
      type: 'confirm',
      title: 'Tizimdan chiqish',
      message: 'Haqiqatan ham tizimdan chiqmoqchimisiz?',
      confirmText: 'Ha, chiqish',
      cancelText: 'Yo\'q, qolish',
      onConfirm: () => {
        logout();
        navigate('/login');
      }
    });
  }, [logout, navigate, showModal]);

  return (
    <div className={`transition-all duration-300 ease-in-out h-screen ${isOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white flex flex-col`}>
      {/* Yuqoridagi qism o'zgarishsiz qoladi */}
      <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} p-4 h-16 border-b border-gray-700`}>
        {isOpen && <span className="font-bold text-xl">Usta Admin</span>}
        <button onClick={toggleSidebar} className="text-white p-2 rounded hover:bg-gray-700 cursor-pointer">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Asosiy menyu qismi */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLink to="/" className={({ isActive }) => `flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''} transition-all duration-200`}>
          <FaHome size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen ? 'hidden' : 'block'} transition-all duration-200`}>Bosh sahifa</span>
        </NavLink>
        
        {/* Foydalanuvchilar nested menu */}
        <div className="space-y-1">
          <button 
            onClick={() => toggleMenu('users')} 
            className={`w-full flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded hover:bg-gray-700 transition-all duration-200 ${expandedMenu === 'users' ? 'bg-gray-800' : ''}`}
          >
            <FaUsers size={20} className="flex-shrink-0 cursor-pointer" />
            {isOpen && (
              <>
                <span className="ml-4 flex-1 text-left cursor-pointer">Foydalanuvchilar</span>
                {expandedMenu === 'users' ? 
                  <FaChevronDown className="text-gray-400" /> : 
                  <FaChevronRight className="text-gray-400" />
                }
              </>
            )}
          </button>
          
          {isOpen && expandedMenu === 'users' && (
            <div className="pl-6 space-y-1 mt-1 bg-gray-800 rounded py-2">
              <NavLink to="/masters" className={({ isActive }) => `flex items-center p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''} transition-all duration-200`}>
                <FaUserAlt size={16} className="flex-shrink-0" />
                <span className="ml-4">Ustalar</span>
              </NavLink>
              <NavLink to="/clients" className={({ isActive }) => `flex items-center p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''} transition-all duration-200`}>
                <FaUser size={16} className="flex-shrink-0" />
                <span className="ml-4">Mijozlar</span>
              </NavLink>
            </div>
          )}
        </div>
        
        <NavLink to="/categories" className={({ isActive }) => `flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''} transition-all duration-200`}>
          <FaTags size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen ? 'hidden' : 'block'} transition-all duration-200`}>Kategoriyalar</span>
        </NavLink>
        <NavLink to="/services" className={({ isActive }) => `flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''} transition-all duration-200`}>
          <FaCog size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen ? 'hidden' : 'block'} transition-all duration-200`}>Xizmatlar</span>
        </NavLink>
        <NavLink to="/countries" className={({ isActive }) => `flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''} transition-all duration-200`}>
          <FaGlobe size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen ? 'hidden' : 'block'} transition-all duration-200`}>Davlatlar</span>
        </NavLink>
        <NavLink to="/regions" className={({ isActive }) => `flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''} transition-all duration-200`}>
          <FaMapMarkedAlt size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen ? 'hidden' : 'block'} transition-all duration-200`}>Viloyatlar</span>
        </NavLink>
        <NavLink to="/districts" className={({ isActive }) => `flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''} transition-all duration-200`}>
          <FaMapMarkerAlt size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen ? 'hidden' : 'block'} transition-all duration-200`}>Tumanlar</span>
        </NavLink>
      </nav>

      {/* Chiqish tugmasi - pastki qismda */}
      <div className="p-4 border-t border-gray-700 mt-auto">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded text-red-400 hover:bg-red-800 hover:text-white cursor-pointer transition-colors duration-200`}
        >
          <FaSignOutAlt size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen ? 'hidden' : 'block'} transition-all duration-200`}>Chiqish</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;