import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import useApi from '../../hooks/useApi';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import PageHeader from '../../components/common/PageHeader';

const API_URL = `${import.meta.env.VITE_API_URL}/categories`;
const FILE_URL = import.meta.env.VITE_FILE_URL;

function CategoryListPage() {
  const [categories, setCategories] = useState([]);
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
    { 
      header: 'Ikonka', 
      align: 'center',
      cell: (row) => {
        const iconId = row.icon;
        const iconUrl = iconId ? `${FILE_URL}/${iconId}` : null;
        
        return (
          <div className="flex items-center justify-center">
            {iconUrl ? (
              <img 
                src={iconUrl}
                alt="Category icon" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  const fallbackElement = document.createElement('span');
                  fallbackElement.textContent = '-';
                  fallbackElement.className = 'text-gray-400';
                  if (e.target.parentElement) {
                    e.target.parentElement.appendChild(fallbackElement);
                  }
                }}
              />
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      }
    }
  ];

  const fetchCategories = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData(API_URL, page, limit);
      setCategories(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      setCategories([]);
      setPagination({ page: 1, limit: 10, pageCount: 1, totalCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  const handleDelete = async (category) => {
    try {
      await deleteData(API_URL, category.id, category.name);
      
      // After deleting, always refresh the current page data
      fetchCategories(pagination.page, pagination.limit);
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const handleDeleteClick = (category) => {
    showModal({
      type: 'confirm',
      title: 'O\'chirishni tasdiqlang',
      message: `'${category.name?.uz || category.id}' nomli kategoriyani haqiqatan ham o'chirmoqchimisiz?`,
      confirmText: 'Ha, o\'chirish',
      cancelText: 'Yo\'q, bekor qilish',
      onConfirm: () => handleDelete(category),
    });
  };

  const handleRowClick = (categoryId) => {
    navigate(`/categories/edit/${categoryId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pageCount && newPage !== pagination.page) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading && categories.length === 0) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Xatolik: {error}</div>;
  }

  return (
    <div className="p-6">
      <PageHeader title="Kategoriyalar Ro'yxati" createLink="/categories/create" />
      
      <Table
        columns={columns}
        data={categories}
        onRowClick={handleRowClick}
        onDelete={handleDeleteClick}
        rowNumber
        pagination={pagination}
        emptyMessage="Kategoriyalar topilmadi."
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pageCount}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default CategoryListPage;