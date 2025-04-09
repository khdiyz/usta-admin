import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function UserCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Viewer', // Default rol
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Haqiqiy API chaqiruvi (POST /api/users) simulyatsiyasi
    console.log('Submitting new user data:', formData);
    setTimeout(() => {
      // Tasavvur qiling, API dan javob keldi
      const isSuccess = Math.random() > 0.1; // 90% muvaffaqiyat ehtimoli

      if (isSuccess) {
        console.log('User created successfully!');
        // Muvaffaqiyatli bo'lsa ro'yxat sahifasiga qaytish
        navigate('/users');
        // Bu yerda muvaffaqiyatli yaratilganlik haqida xabar ko'rsatish mumkin
      } else {
        console.error('Failed to create user');
        setError('Foydalanuvchi yaratishda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
        setIsSubmitting(false);
      }
      // setIsSubmitting(false); // Muvaffaqiyatli bo'lsa ham kerak bo'lmasligi mumkin, chunki redirect bo'ladi
    }, 1500); // 1.5 soniya kutish
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Yangi Foydalanuvchi Yaratish</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Ism
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Parol
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Rol
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="Viewer">Viewer</option>
            <option value="Editor">Editor</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
           <Link to="/users" className="text-gray-600 hover:text-black py-2 px-4 rounded border border-gray-300">
             Bekor qilish
           </Link>
           <button
            type="submit"
            disabled={isSubmitting}
            className={`py-2 px-4 rounded text-white transition duration-150 ease-in-out ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {isSubmitting ? 'Yaratilmoqda...' : 'Saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserCreatePage;