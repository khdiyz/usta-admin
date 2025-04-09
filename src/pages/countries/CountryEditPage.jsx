import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/countries`;

function CountryEditPage() {
  const { countryId } = useParams(); // URL dan ID ni olish
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({ name: { uz: '', ru: '', en: '' } });
  const [loading, setLoading] = useState(true); // Sahifa yuklanishi uchun
  const [isSubmitting, setIsSubmitting] = useState(false); // Forma jo'natilishi uchun
  const [error, setError] = useState(null); // Yuklashdagi xatolik uchun

   // API chaqiruvlari uchun umumiy funksiya (yordamchi)
   const makeApiCall = useCallback(async (url, options) => {
     if (!token) throw new Error("Autentifikatsiya tokeni topilmadi.");
     const response = await fetch(url, {
       ...options,
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json', // POST/PUT uchun kerak
         'Authorization': `Bearer ${token}`,
         ...options.headers,
       },
     });
     if (!response.ok) {
       const errorData = await response.json().catch(() => ({ message: response.statusText }));
       throw new Error(`API xatosi (${response.status}): ${errorData.message || 'Serverdan javob olishda xatolik'}`);
     }
       // PUT 200 yoki 204 qaytarishi mumkin, body bo'lmasligi ham mumkin
      try {
          return await response.json();
      } catch (e) {
          // Agar json parse qilinmasa (masalan 204 No Content)
          return null;
      }
   }, [token]);


  // Komponent yuklanganda davlat ma'lumotlarini olish
  useEffect(() => {
    const fetchCountryData = async () => {
      setLoading(true);
      setError(null);
      try {
        // GET /api/v1/admin/countries/:countryId endpointini chaqirish (taxminiy)
        const data = await makeApiCall(`${API_URL}/${countryId}`, { method: 'GET' });
        if (data && data.name) { // API javobiga moslash kerak
          setFormData({ name: data.name });
        } else {
           // Agar ma'lumot topilmasa yoki kutilgan formatda bo'lmasa
           throw new Error("Davlat ma'lumotlari topilmadi yoki noto'g'ri formatda.");
        }
      } catch (err) {
        console.error("Davlat ma'lumotlarini yuklashda xatolik:", err);
        setError(err.message);
        toast.error(err.message + " Ro'yxatga qaytilmoqda...");
        navigate('/countries');
      } finally {
        setLoading(false);
      }
    };

    if (countryId && token) { // countryId va token mavjud bo'lgandagina chaqirish
       fetchCountryData();
    } else if (!token) {
        setError("Iltimos avval tizimga kiring.");
        setLoading(false);
    }
  }, [countryId, token, makeApiCall, navigate]); // Bog'liqliklarni qo'shish

  const handleChange = (e) => {
    const { name, value } = e.target;
    const lang = name.split('.')[1];
    setFormData(prevData => ({
      ...prevData,
      name: { ...prevData.name, [lang]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const toastId = toast.loading("Yangilanmoqda...");

    try {
      // PUT so'rovini yuborish
      await makeApiCall(`${API_URL}/${countryId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      toast.success("Davlat ma'lumotlari muvaffaqiyatli yangilandi!", { id: toastId });
      navigate('/countries');

    } catch (err) {
      console.error("Yangilashda xatolik:", err);
      toast.error(`Davlatni yangilashda xatolik yuz berdi: ${err.message}`, { id: toastId });
      setIsSubmitting(false); // Xatolik bo'lsa, tugmani aktivlashtirish
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (error && !formData.name.uz) { // Agar xatolik bo'lsa va forma bo'sh bo'lsa (yuklanmagan)
     return <div className="p-6 text-center text-red-500">Xatolik: {error}</div>;
  }


  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Davlatni Tahrirlash</h1>

      {/* Agar yuklashda xatolik bo'lsa ham, formani ko'rsatish mumkin */}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Inputlar (Create Page'dagidek, lekin 'value' bilan to'ldirilgan) */}
        <div>
          <label htmlFor="name.uz" className="block text-sm font-medium text-gray-700 mb-1">Nomi (UZ) <span className="text-red-500">*</span></label>
          <input type="text" id="name.uz" name="name.uz" value={formData.name.uz} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        <div>
          <label htmlFor="name.ru" className="block text-sm font-medium text-gray-700 mb-1">Nomi (RU) <span className="text-red-500">*</span></label>
          <input type="text" id="name.ru" name="name.ru" value={formData.name.ru} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        <div>
          <label htmlFor="name.en" className="block text-sm font-medium text-gray-700 mb-1">Nomi (EN) <span className="text-red-500">*</span></label>
          <input type="text" id="name.en" name="name.en" value={formData.name.en} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
           <Link to="/countries" className="text-gray-600 hover:text-black py-2 px-4 rounded border border-gray-300">Bekor qilish</Link>
           <button
            type="submit"
            disabled={isSubmitting || loading} // Yuklanayotganda ham disable qilish
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

export default CountryEditPage;