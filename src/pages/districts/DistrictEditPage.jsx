import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/districts`;
const COUNTRIES_API_URL = `${import.meta.env.VITE_API_URL}/countries`;
const REGIONS_API_URL = `${import.meta.env.VITE_API_URL}/regions`;

function DistrictEditPage() {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: { uz: '', ru: '', en: '' },
    country: {
      id: '',
      name: { uz: '', ru: '', en: '' }
    },
    region: {
      id: '',
      name: { uz: '', ru: '', en: '' }
    }
  });
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const result = await makeApiCall(`${COUNTRIES_API_URL}?limit=100`, { method: 'GET' });
        setCountries(result.data || []);
      } catch (err) {
        console.error("Davlatlarni yuklashda xatolik:", err);
        setError(err.message);
      }
    };

    fetchCountries();
  }, [makeApiCall]);

  useEffect(() => {
    const fetchRegions = async () => {
      if (!formData.country.id) {
        setRegions([]);
        return;
      }

      try {
        const result = await makeApiCall(`${REGIONS_API_URL}?countryId=${formData.country.id}&limit=100`, { method: 'GET' });
        setRegions(result.data || []);
      } catch (err) {
        console.error("Viloyatlarni yuklashda xatolik:", err);
        setError(err.message);
      }
    };

    fetchRegions();
  }, [formData.country.id, makeApiCall]);

  useEffect(() => {
    const fetchDistrictData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await makeApiCall(`${API_URL}/${districtId}`, { method: 'GET' });
        if (data && data.name) {
          setFormData({
            name: data.name,
            country: data.country || { id: '', name: { uz: '', ru: '', en: '' } },
            region: data.region || { id: '', name: { uz: '', ru: '', en: '' } }
          });
        } else {
          throw new Error("Tuman ma'lumotlari topilmadi yoki noto'g'ri formatda.");
        }
      } catch (err) {
        console.error("Tuman ma'lumotlarini yuklashda xatolik:", err);
        setError(err.message);
        toast.error(err.message + " Ro'yxatga qaytilmoqda...");
        navigate('/districts');
      } finally {
        setLoading(false);
      }
    };

    if (districtId && token) {
      fetchDistrictData();
    } else if (!token) {
      setError("Iltimos avval tizimga kiring.");
      setLoading(false);
    }
  }, [districtId, token, makeApiCall, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'countryId') {
      setFormData(prevData => ({
        ...prevData,
        country: {
          ...prevData.country,
          id: value
        },
        region: {
          id: '',
          name: { uz: '', ru: '', en: '' }
        }
      }));
    } else if (name === 'regionId') {
      setFormData(prevData => ({
        ...prevData,
        region: {
          ...prevData.region,
          id: value
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
      await makeApiCall(`${API_URL}/${districtId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      toast.success("Tuman ma'lumotlari muvaffaqiyatli yangilandi!", { id: toastId });
      navigate('/districts');

    } catch (err) {
      console.error("Yangilashda xatolik:", err);
      toast.error(`Tumanni yangilashda xatolik yuz berdi: ${err.message}`, { id: toastId });
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
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Tumanni Tahrirlash</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Davlat tanlash */}
        <div>
          <label htmlFor="countryId" className="block text-sm font-medium text-gray-700 mb-1">
            Davlat <span className="text-red-500">*</span>
          </label>
          <select
            id="countryId"
            name="countryId"
            value={formData.country.id}
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

        {/* Viloyat tanlash */}
        <div>
          <label htmlFor="regionId" className="block text-sm font-medium text-gray-700 mb-1">
            Viloyat <span className="text-red-500">*</span>
          </label>
          <select
            id="regionId"
            name="regionId"
            value={formData.region.id}
            onChange={handleChange}
            required
            disabled={!formData.country.id}
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
          >
            <option value="">Viloyatni tanlang</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>
                {region.name?.uz || region.id}
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
          <Link to="/districts" className="text-gray-600 hover:text-black py-2 px-4 rounded border border-gray-300">
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

export default DistrictEditPage;
