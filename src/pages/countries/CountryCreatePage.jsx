import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/countries`;

function CountryCreatePage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showModal } = useModal();
  const [formData, setFormData] = useState({
    name: { uz: '', ru: '', en: '' }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forma maydonlari o'zgarganda state'ni yangilash
  const handleChange = (e) => {
    const { name, value } = e.target;
    const lang = name.split('.')[1]; // 'name.uz' dan 'uz' ni ajratib olish

    setFormData(prevData => ({
      ...prevData,
      name: {
        ...prevData.name,
        [lang]: value, // Tegishli til nomini yangilash
      }
    }));
  };

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
     return { response, data: await response.json().catch(() => ({})) };
   }, [token]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // POST so'rovini yuborish
      const { response, data } = await makeApiCall(API_URL, {
        method: 'POST',
        body: JSON.stringify(formData) // Ma'lumotlarni JSONga o'girib yuborish
      });

      if (response.status === 201) {
        // 201 kelsa toast chiqar
        toast.success('Yangi davlat muvaffaqiyatli qo\'shildi!');
        navigate('/countries');
      } else if (!response.ok) {
        throw new Error(`API xatosi (${response.status}): ${data.message || 'Serverdan javob olishda xatolik'}`);
      } else {
        // Boshqa muvaffaqiyatli holatlarda modal ko'rsatish
        showModal({
          type: 'success',
          title: 'Muvaffaqiyatli',
          message: 'Yangi davlat muvaffaqiyatli qo\'shildi!',
          onClose: () => navigate('/countries') // Modal yopilgandan keyin ro'yxatga qaytish
        });
      }

    } catch (err) {
      console.error("Yaratishda xatolik:", err);
      showModal({
        type: 'error',
        title: 'Xatolik',
        message: `Davlat yaratishda xatolik yuz berdi: ${err.message}`,
      });
      setIsSubmitting(false); // Xatolik bo'lsa, tugmani aktivlashtirish
    }
    // finally da setIsSubmitting(false) qilish shart emas, chunki muvaffaqiyatli bo'lsa redirect bo'ladi
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Yangi Davlat Qo'shish</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Uzbek Name */}
        <div>
          <label htmlFor="name.uz" className="block text-sm font-medium text-gray-700 mb-1">
            Nomi (UZ) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name.uz"
            name="name.uz" // name atributi muhim
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
           <Link to="/countries" className="text-gray-600 hover:text-black py-2 px-4 rounded border border-gray-300">
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

export default CountryCreatePage;