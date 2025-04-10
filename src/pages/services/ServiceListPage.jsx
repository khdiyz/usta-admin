import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import useApi from '../../hooks/useApi';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import PageHeader from '../../components/common/PageHeader';

const API_URL = `${import.meta.env.VITE_API_URL}/services`;

function ServiceListPage() {
  const [services, setServices] = useState([]);
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
    { header: 'Kategoriya', field: 'category.name.uz' }
  ];

  const fetchServices = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData(API_URL, page, limit);
      setServices(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Xizmatlarni yuklashda xatolik:', err);
      setError(err.message);
      setServices([]);
      setPagination({ page: 1, limit: 10, pageCount: 1, totalCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  const handleDelete = async (service) => {
    try {
      await deleteData(API_URL, service.id, service.name);
      
      // After deleting, always refresh the current page data
      fetchServices(pagination.page, pagination.limit);
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const handleDeleteClick = (service) => {
    showModal({
      type: 'confirm',
      title: 'O\'chirishni tasdiqlang',
      message: `'${service.name?.uz || service.id}' nomli xizmatni haqiqatan ham o'chirmoqchimisiz?`,
      confirmText: 'Ha, o\'chirish',
      cancelText: 'Yo\'q, bekor qilish',
      onConfirm: () => handleDelete(service),
    });
  };

  const handleRowClick = (serviceId) => {
    navigate(`/services/edit/${serviceId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pageCount && newPage !== pagination.page) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading && services.length === 0) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Xatolik: {error}</div>;
  }

  return (
    <div className="p-6">
      <PageHeader title="Xizmatlar Ro'yxati" createLink="/services/create" />
      
      <Table
        columns={columns}
        data={services}
        onRowClick={handleRowClick}
        onDelete={handleDeleteClick}
        rowNumber
        pagination={pagination}
        emptyMessage="Xizmatlar topilmadi."
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

export default ServiceListPage;
