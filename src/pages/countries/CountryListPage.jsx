// src/pages/countries/CountryListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import useApi from '../../hooks/useApi';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import PageHeader from '../../components/common/PageHeader';

const API_URL = `${import.meta.env.VITE_API_URL}/countries`;

function CountryListPage() {
  const [countries, setCountries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, pageCount: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showModal } = useModal();
  const { fetchData, deleteData } = useApi();
  const navigate = useNavigate();

  const columns = [
    { header: 'Nomi (UZ)', field: 'name.uz' },
    { header: 'Nomi (RU)', field: 'name.ru' },
    { header: 'Nomi (EN)', field: 'name.en' }
  ];

  const fetchCountries = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData(API_URL, page, limit);
      setCountries(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError(err.message);
      setCountries([]);
      setPagination({ page: 1, limit: 10, pageCount: 1, totalCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  const handleDelete = async (country) => {
    try {
      await deleteData(API_URL, country.id, country.name);
      
      // After deleting, always refresh the current page data
      fetchCountries(pagination.page, pagination.limit);
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const handleDeleteClick = (country) => {
    showModal({
      type: 'confirm',
      title: 'O\'chirishni tasdiqlang',
      message: `'${country.name?.uz || country.id}' nomli mamlakatni haqiqatan ham o'chirmoqchimisiz?`,
      confirmText: 'Ha, o\'chirish',
      cancelText: 'Yo\'q, bekor qilish',
      onConfirm: () => handleDelete(country),
    });
  };

  const handleRowClick = (countryId) => {
    navigate(`/countries/edit/${countryId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pageCount && newPage !== pagination.page) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading && countries.length === 0) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Xatolik: {error}</div>;
  }

  return (
    <div className="p-6">
      <PageHeader title="Mamlakatlar Ro'yxati" createLink="/countries/create" />
      
      <Table
        columns={columns}
        data={countries}
        onRowClick={handleRowClick}
        onDelete={handleDeleteClick}
        rowNumber
        pagination={pagination}
        emptyMessage="Mamlakatlar topilmadi."
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pageCount}
        onPageChange={handlePageChange}
        totalCount={pagination.totalCount}
      />
    </div>
  );
}

export default CountryListPage;