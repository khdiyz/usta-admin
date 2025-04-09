import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/services`;
const CATEGORIES_API_URL = `${import.meta.env.VITE_API_URL}/categories`;

function ServiceEditPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: { uz: '', ru: '', en: '' },
    category: {
      id: '',
      name: { uz: '', ru: '', en: '' }
    }
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // API chaqiruvlari uchun umumiy funksiya
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
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API xatosi (${response.status}): ${errorData.message || 'Serverdan javob olishda xatolik'}`);
    }
    try {
      return await response.json();
    } catch (e) {
      return null;
    }
  }, [token]);

  // Kategoriyalarni yuklash
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await makeApiCall(`${CATEGORIES_API_URL}?limit=100`, { method: 'GET' });
        setCategories(result.data || []);
      } catch (err) {
        console.error("Kategoriyalarni yuklashda xatolik:", err);
        setError(err.message);
      }
    };

    fetchCategories();
  }, [makeApiCall]);

  // Xizmat ma'lumotlarini yuklash
  useEffect(() => {
    const fetchServiceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await makeApiCall(`${API_URL}/${serviceId}`, { method: 'GET' });
        if (data) {
          setFormData({
            name: data.name,
            category: data.category
          });
        } else {
          throw new Error("Xizmat ma'lumotlari topilmadi yoki noto'g'ri formatda.");
        }
      } catch (err) {
        console.error("Xizmat ma'lumotlarini yuklashda xatolik:", err);
        setError(err.message);
        toast.error(err.message + " Ro'yxatga qaytilmoqda...");
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId && token) {
      fetchServiceData();
    } else if (!token) {
      setError("Iltimos avval tizimga kiring.");
      setLoading(false);
    }
  }, [serviceId, token, makeApiCall, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'categoryId') {
      const selectedCategory = categories.find(c => c.id === value);
      setFormData(prevData => ({
        ...prevData,
        category: {
          id: value,
          name: selectedCategory ? selectedCategory.name : { uz: '', ru: '', en: '' }
        }
      }));
    } else {
      const lang = name.split('.')[1];
      setFormData(prevData => ({
        ...prevData,
        name: {
          ...prevData.name,
          [lang]: value
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const toastId = toast.loading("Yangilanmoqda...");

    try {
      await makeApiCall(`${API_URL}/${serviceId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          categoryId: formData.category.id
        })
      });

      toast.success("Xizmat ma'lumotlari muvaffaqiyatli yangilandi!", { id: toastId });
      navigate('/services');

    } catch (err) {
      console.error("Yangilashda xatolik:", err);
      toast.error(`Xizmatni yangilashda xatolik yuz berdi: ${err.message}`, { id: toastId });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (error && !formData.name.uz) {
    return <div className="p-6 text-center text-red-500">Xatolik: {error}</div>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Xizmatni Tahrirlash</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Kategoriya tanlash */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Kategoriya <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.category.id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="">Kategoriyani tanlang</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name?.uz || category.id}
              </option>
            ))}
          </select>
        </div>

        {/* Uzbek Name */}
        <div>
          <label htmlFor="name.uz" className="block text-sm font-medium text-gray-700 mb-1">
            Nomi (UZ) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name.uz"
            name="name.uz"
            value={formData.name.uz}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Russian Name */}
        <div>
          <label htmlFor="name.ru" className="block text-sm font-medium text-gray-700 mb-1">
            Nomi (RU) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name.ru"
            name="name.ru"
            value={formData.name.ru}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* English Name */}
        <div>
          <label htmlFor="name.en" className="block text-sm font-medium text-gray-700 mb-1">
            Nomi (EN) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name.en"
            name="name.en"
            value={formData.name.en}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Link to="/services" className="text-gray-600 hover:text-black py-2 px-4 rounded border border-gray-300">
            Bekor qilish
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className={`py-2 px-4 rounded text-white transition duration-150 ease-in-out cursor-pointer ${
              isSubmitting || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {isSubmitting ? 'Yangilanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ServiceEditPage;
