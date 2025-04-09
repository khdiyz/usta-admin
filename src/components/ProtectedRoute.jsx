import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuth(); // AuthContext'dan holatni olish
  const location = useLocation(); // Foydalanuvchi qaysi sahifaga kirmoqchi ekanligini bilish uchun

   // Tokenni tekshirish (oddiy misol, haqiqiy dasturda serverda tekshirish yaxshiroq)
   // Bu yerda token muddati o'tganligini yoki valid ekanligini tekshirish logikasi qo'shilishi mumkin

   if (!isAuthenticated && !token) { // Yoki !token (agar isAuthenticated darhol yangilanmasa)
    // Agar tizimga kirmagan bo'lsa, login sahifasiga yo'naltirish
    // 'state={{ from: location }}' login dan keyin shu sahifaga qaytish uchun kerak
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Agar tizimga kirgan bo'lsa, so'ralgan komponentni (children) ko'rsatish
  return children;
}

export default ProtectedRoute;