import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';

// Namuna uchun ma'lumotlar (API o'rniga)
const mockClients = [
  { id: 1, name: 'Shoira Hamidova', email: 'shoira@example.com', phone: '+998 90 123 45 67', orders: 5 },
  { id: 2, name: 'Botir Sodiqov', email: 'botir@example.com', phone: '+998 91 234 56 78', orders: 3 },
  { id: 3, name: 'Malika Azizova', email: 'malika@example.com', phone: '+998 99 345 67 89', orders: 8 },
];

function ClientListPage() {
  const [clients, setClients] = useState([]);
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
        // Tasavvur qiling, bu yerda fetch('/api/clients') chaqirildi
        setClients(mockClients);
        setLoading(false);
      } catch (err) {
        setError('Mijozlarni yuklashda xatolik');
        setLoading(false);
        console.error(err);
      }
    }, 200);
  }, []);

  // Mijozni o'chirish (API simulyatsiyasi)
  const handleDelete = (clientId, clientName) => {
    showModal({
      type: 'confirm',
      title: 'O\'chirishni tasdiqlang',
      message: `'${clientName}' ismli mijozni haqiqatan ham o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`,
      confirmText: 'Ha, o\'chirish',
      cancelText: 'Yo\'q, bekor qilish',
      onConfirm: () => {
        setClients(prevClients => prevClients.filter(client => client.id !== clientId));
        showModal({
            type: 'success',
            title: 'Muvaffaqiyatli',
            message: `'${clientName}' o'chirildi.`,
        });
      },
    });
  };

  const handleDeleteClick = (e, clientId, clientName) => {
    e.stopPropagation();
    handleDelete(clientId, clientName);
  };
  
  const handleRowClick = (clientId) => {
    navigate(`/clients/edit/${clientId}`);
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
        <h1 className="text-2xl font-semibold text-gray-800">Mijozlar Ro'yxati</h1>
        <Link
          to="/clients/create"
          className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out"
        >
          <FaPlus className="mr-2" /> Yangi qo'shish
        </Link>
      </div>

      <div className="bg-white shadow-md rounded overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ism</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyurtmalar</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Mijozlar topilmadi.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
                  onClick={() => handleRowClick(client.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.orders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => handleDeleteClick(e, client.id, client.name)}
                      title="O'chirish"
                      className="text-gray-600 hover:text-red-600 inline-block p-1"
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

export default ClientListPage; 