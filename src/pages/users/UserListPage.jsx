import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';

// Namuna uchun ma'lumotlar (API o'rniga)
const mockUsers = [
  { id: 1, name: 'Ali Valiyev', email: 'ali@example.com', role: 'Admin' },
  { id: 2, name: 'Vali Aliyev', email: 'vali@example.com', role: 'Editor' },
  { id: 3, name: 'Salima Tolipova', email: 'salima@example.com', role: 'Viewer' },
];

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showModal } = useModal();
  const navigate = useNavigate();

  // Ma'lumotlarni "yuklash" (API simulyatsiyasi)
  useEffect(() => {
    setLoading(true);
    setError(null);
    // Haqiqiy API chaqiruvi o'rniga setTimeout
    setTimeout(() => {
      try {
        // Tasavvur qiling, bu yerda fetch('/api/users') chaqirildi
        setUsers(mockUsers);
        setLoading(false);
      } catch (err) {
        setError('Foydalanuvchilarni yuklashda xatolik');
        setLoading(false);
        console.error(err);
      }
    }, 200); // 1 soniya kutish
  }, []);

  // Foydalanuvchini o'chirish (API simulyatsiyasi)
  const handleDelete = (userId, userName) => {
    showModal({
      type: 'confirm', // Tasdiqlash turi
      title: 'O\'chirishni tasdiqlang',
      message: `'${userName}' ismli foydalanuvchini haqiqatan ham o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`,
      confirmText: 'Ha, o\'chirish',
      cancelText: 'Yo\'q, bekor qilish',
      onConfirm: () => { // Tasdiqlanganda bajariladigan amal
        console.log('Deleting user with id:', userId);
        // Haqiqiy API chaqiruvi (DELETE /api/users/:id) o'rniga:
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        // Muvaffaqiyatli o'chirilganlik haqida xabar berish (yana modal orqali)
        showModal({
            type: 'success',
            title: 'Muvaffaqiyatli',
            message: `'${userName}' o'chirildi.`,
        });
      },
      // onCancel: () => { console.log('Delete cancelled'); } // Agar bekor qilinganda biror amal kerak bo'lsa
    });
  };

  // O'chirish tugmasi bosilganda qator onClick'ini to'xtatish uchun
  const handleDeleteClick = (e, userId, userName) => {
    e.stopPropagation(); // Qatorning onClick hodisasini bloklash
    handleDelete(userId, userName); // Asosiy o'chirish funksiyasini chaqirish
  };
  
  // Qator bosilganda tahrirlash sahifasiga o'tish
  const handleRowClick = (userId) => {
    navigate(`/users/edit/${userId}`);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Xatolik: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Foydalanuvchilar Ro'yxati</h1>
        <Link
          to="/users/create"
          className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out"
        >
          <FaPlus className="mr-2" /> Yangi qo'shish
        </Link>
      </div>

      <div className="bg-white shadow-md rounded overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* --- th (sarlavhalar) o'zgarishsiz --- */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ism</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Foydalanuvchilar topilmadi.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out" // Hover effekti va kursor qo'shildi
                  onClick={() => handleRowClick(user.id)} // Qatorga bosish hodisasi qo'shildi
                >
                  {/* --- td (ma'lumotlar) o'zgarishsiz --- */}
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.name}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.role}</td>
                  {/* --- Amallar ustuni --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Tahrirlash ikonka/link OLIB TASHLANDI */}
                    <button
                      onClick={(e) => handleDeleteClick(e, user.id, user.name)} // Yangi handler ishlatildi
                      title="O'chirish"
                      className="text-gray-600 hover:text-red-600 inline-block p-1" // Tugma atrofida bosish oson bo'lishi uchun padding
                    >
                      <FaTrashAlt size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserListPage;