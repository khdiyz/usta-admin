import React, { createContext, useState, useContext, useEffect } from 'react';

// Context yaratish
const AuthContext = createContext(null);

// Simulyatsiya qilingan API chaqiruvi (login uchun)
const fakeLoginApi = async (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Haqiqiy API da bu yerda serverga POST so'rov yuboriladi
      if (username === 'admin' && password === 'password123') {
        // Muvaffaqiyatli bo'lsa, serverdan kelgan JWT token
        const fakeJwtToken = `fake-jwt-token.${btoa(username)}.${Date.now()}`;
        resolve({ token: fakeJwtToken });
      } else {
        reject(new Error('Noto\'g\'ri foydalanuvchi nomi yoki parol'));
      }
    }, 200); // 1 soniya kutish
  });
};

// Provider komponenti
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(false); // Login jarayoni uchun
  const [authError, setAuthError] = useState(null);

  // Token o'zgarganda localStorage ni yangilash
  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await fakeLoginApi(username, password);
      setToken(response.token);
      // Login muvaffaqiyatli bo'lsa asosiy sahifaga o'tish
      // Yoki agar 'from' state mavjud bo'lsa, o'sha sahifaga qaytish
      // Bu qism ProtectedRoute da ham boshqarilishi mumkin
      // navigate(location.state?.from?.pathname || '/', { replace: true }); // Buni ProtectedRoute da qilish yaxshiroq
    } catch (error) {
      setAuthError(error.message || 'Login qilishda xatolik');
      setToken(null); // Xatolik bo'lsa tokenni tozalash
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
  };

  const value = {
    token,
    isAuthenticated: !!token, // Token mavjud bo'lsa true
    loading,
    authError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Context'ni ishlatish uchun custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};