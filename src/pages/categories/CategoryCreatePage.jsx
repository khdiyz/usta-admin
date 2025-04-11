import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/categories`;

function CategoryCreatePage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showModal } = useModal();
  const [formData, setFormData] = useState({
    name: { uz: '', ru: '', en: '' },
    icon: null,
    iconId: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Forma maydonlari o'zgarganda state'ni yangilash
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('name.')) {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        icon: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Send file to API
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      fetch(`${import.meta.env.VITE_API_URL}/files`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
        body: formDataToSend
      })
      .then(response => response.json())
      .then(data => {
        setFormData(prev => ({
          ...prev,
          iconId: data.id
        }));
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
    }
  };

  // API chaqiruvi uchun yordamchi funksiya
  const makeApiCall = useCallback(async (url, options) => {
    if (!token) throw new Error("Autentifikatsiya tokeni topilmadi.");
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    return { response, data: await response.json().catch(() => ({})) };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const categoryData = {
        icon: formData.iconId,
        name: formData.name
      };

      const { response, data } = await makeApiCall(`${import.meta.env.VITE_API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });

      if (response.status === 201) {
        toast.success('Yangi kategoriya muvaffaqiyatli qo\'shildi!');
        navigate('/categories');
      } else if (!response.ok) {
        throw new Error(`API xatosi (${response.status}): ${data.message || 'Serverdan javob olishda xatolik'}`);
      } else {
        showModal({
          type: 'success',
          title: 'Muvaffaqiyatli',
          message: 'Yangi kategoriya muvaffaqiyatli qo\'shildi!',
          onClose: () => navigate('/categories')
        });
      }
    } catch (err) {
      console.error("Yaratishda xatolik:", err);
      showModal({
        type: 'error',
        title: 'Xatolik',
        message: `Kategoriya yaratishda xatolik yuz berdi: ${err.message}`,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Yangi Kategoriya Qo'shish</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Icon Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ikonka
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black file:opacity-0"
              />
            </div>
            {previewUrl && (
              <div className="w-16 h-16 border rounded overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Link to="/categories" className="text-gray-600 hover:text-black py-2 px-4 rounded border border-gray-300">
            Bekor qilish
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`py-2 px-4 rounded text-white transition duration-150 ease-in-out ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CategoryCreatePage;
