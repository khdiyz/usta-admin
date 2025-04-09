// src/components/Sidebar.jsx (mavjud kodga qo'shimcha)
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaUsers, FaBoxOpen, FaSignOutAlt, FaGlobe, FaMapMarkedAlt, FaMapMarkerAlt, FaTags } from 'react-icons/fa'; // FaSignOutAlt qo'shildi
import { useAuth } from '../context/AuthContext'; // useAuth import qilindi
import { useModal } from '../context/ModalContext'; // useModal qo'shildi

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { logout } = useAuth(); // logout funksiyasi context'dan olindi
  const { showModal } = useModal(); // Modal uchun hook qo'shildi
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`transition-all duration-300 ease-in-out h-screen ${isOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white flex flex-col`}>
      {/* Yuqoridagi qism o'zgarishsiz qoladi */}
      <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} p-4 h-16 border-b border-gray-700`}>
        {isOpen && <span className="font-bold text-xl">Admin Panel</span>}
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
        <NavLink to="/users" className={({ isActive }) => `flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''} transition-all duration-200`}>
          <FaUsers size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen ? 'hidden' : 'block'} transition-all duration-200`}>Foydalanuvchilar</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''} transition-all duration-200`}>
          <FaBoxOpen size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen ? 'hidden' : 'block'} transition-all duration-200`}>Mahsulotlar</span>
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => `flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''} transition-all duration-200`}>
          <FaTags size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen ? 'hidden' : 'block'} transition-all duration-200`}>Kategoriyalar</span>
        </NavLink>
        <NavLink to="/countries" className={({ isActive }) => `flex items-center p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`}>
          <FaGlobe size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen && 'hidden'}`}>Davlatlar</span>
        </NavLink>
        <NavLink to="/regions" className={({ isActive }) => `flex items-center p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`}>
          <FaMapMarkedAlt size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen && 'hidden'}`}>Viloyatlar</span>
        </NavLink>
        <NavLink to="/districts" className={({ isActive }) => `flex items-center p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`}>
          <FaMapMarkerAlt size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen && 'hidden'}`}>Tumanlar</span>
        </NavLink>
      </nav>

      {/* Chiqish tugmasi - pastki qismda */}
      <div className="p-4 border-t border-gray-700 mt-auto">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${!isOpen ? 'justify-center' : ''} p-2 rounded text-red-400 hover:bg-red-800 hover:text-white cursor-pointer`}
        >
          <FaSignOutAlt size={20} className="flex-shrink-0" />
          <span className={`ml-4 ${!isOpen ? 'hidden' : 'block'} transition-all duration-200`}>Chiqish</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;