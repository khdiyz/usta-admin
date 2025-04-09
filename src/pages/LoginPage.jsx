import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // useAuth hook'ini import qilish

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, authError, isAuthenticated } = useAuth(); // Auth context'dan kerakli narsalarni olish
  const navigate = useNavigate();
  const location = useLocation();

  // Agar foydalanuvchi allaqachon tizimga kirgan bo'lsa, uni asosiy sahifaga yo'naltirish
   useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'; // Qayerdan kelgan bo'lsa, o'sha yerga qaytarish
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
    // Muvaffaqiyatli login bo'lsa, useEffect yuqorida redirect qiladi
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Tizimga Kirish</h1>

        {authError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Foydalanuvchi nomi
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="admin" // Namuna uchun
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 mb-1">
              Parol
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="password123" // Namuna uchun
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded text-white transition duration-150 ease-in-out cursor-pointer ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;