// src/pages/countries/CountryListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaPlus, FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

const API_URL = `${import.meta.env.VITE_API_URL}/countries`;

// Sahifa raqamlarini generatsiya qilish
const generatePageNumbers = (currentPage, totalPages, maxVisiblePages = 7) => {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const sidePages = Math.floor((maxVisiblePages - 3) / 2);
  const leftEllipsis = currentPage > sidePages + 2;
  const rightEllipsis = currentPage < totalPages - sidePages - 1;

  let pages = [1];

  if (leftEllipsis) {
    pages.push('...');
  }

  const startPage = leftEllipsis ? Math.max(2, currentPage - sidePages) : 2;
  const endPage = rightEllipsis ? Math.min(totalPages - 1, currentPage + sidePages) : totalPages - 1;

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (rightEllipsis) {
    pages.push('...');
  }

  pages.push(totalPages);

  return [...new Set(pages)];
};

function CountryListPage() {
  const [countries, setCountries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, pageCount: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showModal } = useModal();
  const { token } = useAuth();
  const navigate = useNavigate();

  const makeApiCall = useCallback(async (url, options) => {
    if (!token) throw new Error("Autentifikatsiya tokeni topilmadi.");
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (!response.ok) {
      if (response.status === 204 && options.method === 'DELETE') {
        return null;
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API xatosi (${response.status}): ${errorData.message || 'Serverdan javob olishda xatolik'}`);
    }
    return response.status === 204 ? null : response.json();
  }, [token]);

  const fetchCountries = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await makeApiCall(`${API_URL}?limit=${limit}&page=${page}`, { method: 'GET' });
      setCountries(result.data || []);
      setPagination(prev => ({
        ...prev,
        page: result.pagination?.page || 1,
        pageCount: result.pagination?.pageCount || 1,
        totalCount: result.pagination?.totalCount || 0,
      }));
    } catch (err) {
      console.error("Mamlakatlarni yuklashda xatolik:", err);
      setError(err.message);
      setCountries([]);
      setPagination({ page: 1, limit: 10, pageCount: 1, totalCount: 0 });
    } finally {
      setLoading(false);
    }
  }, [makeApiCall]);

  useEffect(() => {
    fetchCountries(pagination.page, pagination.limit);
  }, [fetchCountries, pagination.page, pagination.limit]);

  const handleDelete = async (countryId) => {
    try {
      await makeApiCall(`${API_URL}/${countryId}`, { method: 'DELETE' });
      toast.success('Mamlakat muvaffaqiyatli o\'chirildi');
      fetchCountries(pagination.page, pagination.limit);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mamlakatlar</h1>
        <Link
          to="/countries/create"
          className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out"
        >
          <FaPlus className="mr-2" /> Yangi qo'shish
        </Link>
      </div>

      <div className="bg-white shadow-md rounded overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">T/R</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomi (UZ)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomi (RU)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomi (EN)</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {countries.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Mamlakatlar topilmadi.
                </td>
              </tr>
            ) : (
              countries.map((country, index) => {
                const rowNumber = (pagination.page - 1) * pagination.limit + index + 1;
                return (
                  <tr
                    key={country.id}
                    className="hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
                    onClick={() => navigate(`/countries/edit/${country.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{rowNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{country.name?.uz || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{country.name?.ru || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{country.name?.en || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showModal({
                            type: 'confirm',
                            title: 'O\'chirishni tasdiqlang',
                            message: `'${country.name?.uz || country.id}' nomli mamlakatni haqiqatan ham o'chirmoqchimisiz?`,
                            confirmText: 'Ha, o\'chirish',
                            cancelText: 'Yo\'q, bekor qilish',
                            onConfirm: () => handleDelete(country.id),
                          });
                        }}
                        title="O'chirish"
                        className="text-gray-600 hover:text-red-600 inline-block p-1 cursor-pointer"
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm space-y-2 sm:space-y-0">
        <p className="text-gray-600">
          Jami: {pagination.totalCount} ta {pagination.pageCount > 1 ? `(Sahifa ${pagination.page} / ${pagination.pageCount})` : ''}
        </p>

        {pagination.totalCount > 0 && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={loading || pagination.page <= 1}
              className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Birinchi sahifa"
            >
              <FaAngleDoubleLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={loading || pagination.page <= 1}
              className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Oldingi sahifa"
            >
              <FaAngleLeft size={16} />
            </button>

            {generatePageNumbers(pagination.page, pagination.pageCount).map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`py-1 px-3 rounded border border-gray-300 transition-colors duration-150 ease-in-out ${
                      page === pagination.page
                        ? 'bg-black text-white border-black cursor-default'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={loading || pagination.page >= pagination.pageCount}
              className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Keyingi sahifa"
            >
              <FaAngleRight size={16} />
            </button>
            <button
              onClick={() => handlePageChange(pagination.pageCount)}
              disabled={loading || pagination.page >= pagination.pageCount}
              className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Oxirgi sahifa"
            >
              <FaAngleDoubleRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CountryListPage;