import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';
import useApi from '../../hooks/useApi';

const FILE_URL = import.meta.env.VITE_FILE_URL || 'http://localhost:4040/files';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4040/api/v1/admin';

function MasterListPage() {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    pageCount: 1,
    totalCount: 0
  });
  const { showModal } = useModal();
  const { fetchData, deleteData } = useApi();
  const navigate = useNavigate();

  // Ma'lumotlarni API dan yuklash
  const fetchMasters = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData(`${API_URL}/masters`, page, limit);
      setMasters(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError('Ustalarni yuklashda xatolik: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasters(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  // Ustani o'chirish
  const handleDelete = async (master) => {
    try {
      await deleteData(`${API_URL}/masters`, master.id, master.fullName);
      
      // After deleting, refresh the current page data
      fetchMasters(pagination.page, pagination.limit);
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const handleDeleteClick = (e, master) => {
    e.stopPropagation();
    showModal({
      type: 'confirm',
      title: 'O\'chirishni tasdiqlang',
      message: `'${master.fullName}' ismli ustani haqiqatan ham o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`,
      confirmText: 'Ha, o\'chirish',
      cancelText: 'Yo\'q, bekor qilish',
      onConfirm: () => handleDelete(master),
    });
  };
  
  const handleEditClick = (e, masterId) => {
    e.stopPropagation();
    navigate(`/masters/edit/${masterId}`);
  };
  
  const handleRowClick = (masterId) => {
    navigate(`/masters/edit/${masterId}`);
  };

  if (loading && masters.length === 0) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Xatolik: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Ustalar Ro'yxati</h1>
        <Link
          to="/masters/create"
          className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out"
        >
          <FaPlus className="mr-2" /> Yangi qo'shish
        </Link>
      </div>

      <div className="bg-white shadow-md rounded overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T/R</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rasm</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ism</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turon ID</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {masters.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Ustalar topilmadi.
                </td>
              </tr>
            ) : (
              masters.map((master, index) => (
                <tr
                  key={master.id}
                  className="hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
                  onClick={() => handleRowClick(master.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center justify-center">
                      {master.photo ? (
                        <img 
                          src={`${FILE_URL}/${master.photo}`}
                          alt={`${master.fullName} rasmi`} 
                          className="w-10 h-10 object-cover rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                          {master.fullName?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{master.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{master.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{master.turonId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => handleEditClick(e, master.id)}
                      title="Tahrirlash"
                      className="text-gray-600 hover:text-blue-600 inline-block p-1 mr-2"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, master)}
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
      
      {pagination.pageCount > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded-md mr-2 bg-gray-200 disabled:opacity-50"
            >
              Oldingi
            </button>
            <span className="mx-2">
              {pagination.page} / {pagination.pageCount}
            </span>
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pageCount, prev.page + 1) }))}
              disabled={pagination.page === pagination.pageCount}
              className="px-3 py-1 rounded-md ml-2 bg-gray-200 disabled:opacity-50"
            >
              Keyingi
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default MasterListPage; 