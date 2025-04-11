import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';
import Pagination from '../../components/common/Pagination';
import useClientQueries from '../../hooks/useClientQueries';

const FILE_URL = import.meta.env.VITE_FILE_URL || 'http://localhost:4040/files';

function ClientListPage() {
  const [paginationState, setPaginationState] = useState({
    page: 1,
    limit: 10
  });
  const { showModal } = useModal();
  const navigate = useNavigate();
  
  // Use TanStack Query hooks
  const { useClients, useDeleteClient } = useClientQueries();
  const { data, isLoading, isError, error } = useClients(paginationState.page, paginationState.limit);
  const deleteClientMutation = useDeleteClient();

  const clients = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    pageCount: 1,
    totalCount: 0
  };

  // Mijozni o'chirish
  const handleDelete = async (client) => {
    deleteClientMutation.mutate(client.id);
  };

  const handleDeleteClick = (e, client) => {
    e.stopPropagation();
    showModal({
      type: 'confirm',
      title: 'O\'chirishni tasdiqlang',
      message: `'${client.fullName}' ismli mijozni haqiqatan ham o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`,
      confirmText: 'Ha, o\'chirish',
      cancelText: 'Yo\'q, bekor qilish',
      onConfirm: () => handleDelete(client),
    });
  };
  
  const handleRowClick = (clientId) => {
    navigate(`/clients/edit/${clientId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pageCount && newPage !== pagination.page) {
      setPaginationState(prev => ({ ...prev, page: newPage }));
    }
  };

  if (isLoading && clients.length === 0) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (isError) {
    return <div className="p-6 text-center text-red-500">Xatolik: {error.message}</div>;
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T/R</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rasm</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ism</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turon ID</th>
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
              clients.map((client, index) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
                  onClick={() => handleRowClick(client.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center justify-center">
                      {client.photo ? (
                        <img 
                          src={`${FILE_URL}/${client.photo}`}
                          alt={`${client.fullName} rasmi`} 
                          className="w-10 h-10 object-cover rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(client.fullName?.split(' ')[0])}&background=gray&color=fff&size=40`;
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                          {client.fullName?.split(' ')[0]?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.turonId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => handleDeleteClick(e, client)}
                      title="O'chirish"
                      className="text-gray-600 hover:text-red-600 inline-block p-1"
                      disabled={deleteClientMutation.isLoading}
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
      
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pageCount}
        onPageChange={handlePageChange}
        totalCount={pagination.totalCount}
      />
    </div>
  );
}

export default ClientListPage; 