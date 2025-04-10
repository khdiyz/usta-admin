import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import useApi from '../../hooks/useApi';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import PageHeader from '../../components/common/PageHeader';

const API_URL = `${import.meta.env.VITE_API_URL}/products`;
const FILE_URL = import.meta.env.VITE_FILE_URL;

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, pageCount: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showModal } = useModal();
  const { fetchData, deleteData } = useApi();
  const navigate = useNavigate();

  const columns = [
    { header: 'Rasm', field: 'image', type: 'image', baseUrl: FILE_URL },
    { header: 'Nomi (UZ)', field: 'name.uz' },
    { header: 'Nomi (RU)', field: 'name.ru' },
    { header: 'Nomi (EN)', field: 'name.en' },
    { header: 'Kategoriya', field: 'category.name.uz' },
    { header: 'Pastki Kategoriya', field: 'subcategory.name.uz' },
    { header: 'Narx', field: 'price', type: 'number' },
    { header: 'Status', field: 'status' }
  ];

  const fetchProducts = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData(API_URL, page, limit);
      setProducts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
      setPagination({ page: 1, limit: 10, pageCount: 1, totalCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  const handleDelete = async (product) => {
    try {
      await deleteData(API_URL, product.id, product.name);
      
      if (products.length === 1) {
        if (pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchProducts(1, pagination.limit);
        }
      } else {
        setProducts(prev => prev.filter(p => p.id !== product.id));
        setPagination(prev => ({
          ...prev,
          totalCount: Math.max(0, prev.totalCount - 1)
        }));
      }
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const handleDeleteClick = (product) => {
    showModal({
      type: 'confirm',
      title: 'O\'chirishni tasdiqlang',
      message: `'${product.name?.uz || product.id}' nomli mahsulotni haqiqatan ham o'chirmoqchimisiz?`,
      confirmText: 'Ha, o\'chirish',
      cancelText: 'Yo\'q, bekor qilish',
      onConfirm: () => handleDelete(product),
    });
  };

  const handleRowClick = (productId) => {
    navigate(`/products/edit/${productId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pageCount && newPage !== pagination.page) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading && products.length === 0) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Xatolik: {error}</div>;
  }

  return (
    <div className="p-6">
      <PageHeader title="Mahsulotlar Ro'yxati" createLink="/products/create" />
      
      <Table
        columns={columns}
        data={products}
        onRowClick={handleRowClick}
        onDelete={handleDeleteClick}
        rowNumber
        pagination={pagination}
        emptyMessage="Mahsulotlar topilmadi."
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

export default ProductListPage; 