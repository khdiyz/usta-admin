import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import useApi from '../../hooks/useApi';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import PageHeader from '../../components/common/PageHeader';

const API_URL = `${import.meta.env.VITE_API_URL}/districts`;

function DistrictListPage() {
  const [districts, setDistricts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, pageCount: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showModal } = useModal();
  const { fetchData, deleteData } = useApi();
  const navigate = useNavigate();

  const columns = [
    { header: 'Nomi (UZ)', field: 'name.uz' },
    { header: 'Nomi (RU)', field: 'name.ru' },
    { header: 'Nomi (EN)', field: 'name.en' },
    { header: 'Davlat', field: 'country.name.uz' },
    { header: 'Viloyat', field: 'region.name.uz' }
  ];

  const fetchDistricts = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching districts from:', `${API_URL}?limit=${limit}&page=${page}`);
      const result = await fetchData(API_URL, page, limit);
      console.log('Received data:', result);
      setDistricts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching districts:', err);
      setError(err.message);
      setDistricts([]);
      setPagination({ page: 1, limit: 10, pageCount: 1, totalCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('API URL:', API_URL);
    fetchDistricts(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  const handleDelete = async (district) => {
    try {
      await deleteData(API_URL, district.id, district.name);
      
      if (districts.length === 1) {
        if (pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchDistricts(1, pagination.limit);
        }
      } else {
        setDistricts(prev => prev.filter(d => d.id !== district.id));
        setPagination(prev => ({
          ...prev,
          totalCount: Math.max(0, prev.totalCount - 1)
        }));
      }
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const handleDeleteClick = (district) => {
    showModal({
      type: 'confirm',
      title: 'O\'chirishni tasdiqlang',
      message: `'${district.name?.uz || district.id}' nomli tumni haqiqatan ham o'chirmoqchimisiz?`,
      confirmText: 'Ha, o\'chirish',
      cancelText: 'Yo\'q, bekor qilish',
      onConfirm: () => handleDelete(district),
    });
  };

  const handleRowClick = (districtId) => {
    navigate(`/districts/edit/${districtId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pageCount && newPage !== pagination.page) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading && districts.length === 0) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Xatolik: {error}</div>;
  }

  return (
    <div className="p-6">
      <PageHeader title="Tumanlar Ro'yxati" createLink="/districts/create" />
      
      <Table
        columns={columns}
        data={districts}
        onRowClick={handleRowClick}
        onDelete={handleDeleteClick}
        rowNumber
        pagination={pagination}
        emptyMessage="Tumanlar topilmadi."
      />

      {pagination.pageCount > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pageCount}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default DistrictListPage;
