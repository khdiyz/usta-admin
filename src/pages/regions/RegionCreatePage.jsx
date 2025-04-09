import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/regions`;
const COUNTRIES_API_URL = `${import.meta.env.VITE_API_URL}/countries`;

function RegionCreatePage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showModal } = useModal();
  const [formData, setFormData] = useState({
    name: { uz: '', ru: '', en: '' },
    countryId: ''
  });
  const [countries, setCountries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // API chaqiruvi uchun yordamchi funksiya
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
    return response.json();
  }, [token]);

  // Davlatlarni yuklash
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const result = await makeApiCall(`${COUNTRIES_API_URL}?limit=100`, { method: 'GET' });
        setCountries(result.data || []);
      } catch (err) {
        console.error("Davlatlarni yuklashda xatolik:", err);
        showModal({
          type: 'error',
          title: 'Xatolik',
          message: `Davlatlarni yuklashda xatolik yuz berdi: ${err.message}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [makeApiCall, showModal]);

  // Forma maydonlari o'zgarganda state'ni yangilash
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'countryId') {
      setFormData(prevData => ({
        ...prevData,
        countryId: value
      }));
    } else {
      const lang = name.split('.')[1]; // 'name.uz' dan 'uz' ni ajratib olish
      setFormData(prevData => ({
        ...prevData,
        name: {
          ...prevData.name,
          [lang]: value,
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await makeApiCall(API_URL, {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response) {
        toast.success('Yangi viloyat muvaffaqiyatli qo\'shildi!');
        navigate('/regions');
      } else {
        throw new Error('Serverdan javob olishda xatolik');
      }
    } catch (err) {
      console.error("Yaratishda xatolik:", err);
      showModal({
        type: 'error',
        title: 'Xatolik',
        message: `Viloyat yaratishda xatolik yuz berdi: ${err.message}`,
      });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Yangi Viloyat Qo'shish</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Davlat tanlash */}
        <div>
          <label htmlFor="countryId" className="block text-sm font-medium text-gray-700 mb-1">
            Davlat <span className="text-red-500">*</span>
          </label>
          <select
            id="countryId"
            name="countryId"
            value={formData.countryId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="">Davlatni tanlang</option>
            {countries.map(country => (
              <option key={country.id} value={country.id}>
                {country.name?.uz || country.id}
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
          <Link to="/regions" className="text-gray-600 hover:text-black py-2 px-4 rounded border border-gray-300">
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

export default RegionCreatePage; 