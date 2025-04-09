import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Namuna uchun ma'lumotlar (API o'rniga)
const mockUsers = [
  { id: 1, name: 'Ali Valiyev', email: 'ali@example.com', role: 'Admin' },
  { id: 2, name: 'Vali Aliyev', email: 'vali@example.com', role: 'Editor' },
  { id: 3, name: 'Salima Tolipova', email: 'salima@example.com', role: 'Viewer' },
];

function UserEditPage() {
  const { userId } = useParams(); // URL dan ID ni olish
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Foydalanuvchi ma'lumotlarini "yuklash" (API simulyatsiyasi)
  useEffect(() => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    console.log('Fetching user with id:', userId);

    // Haqiqiy API chaqiruvi (GET /api/users/:id) simulyatsiyasi
    setTimeout(() => {
      const userToEdit = mockUsers.find(user => user.id === parseInt(userId));

      if (userToEdit) {
        setFormData({
          name: userToEdit.name,
          email: userToEdit.email,
          role: userToEdit.role,
          // Parolni odatda tahrirlash formasida ko'rsatmaymiz yoki alohida o'zgartiramiz
        });
        setLoading(false);
      } else {
        setError(null); // Xatolik emas, balki topilmadi
        setNotFound(true);
        setLoading(false);
      }
    }, 200); // 1 soniya kutish
  }, [userId]);

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

    // Haqiqiy API chaqiruvi (PUT /api/users/:id) simulyatsiyasi
    console.log('Submitting updated user data for id:', userId, formData);
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% muvaffaqiyat

      if (isSuccess) {
        console.log('User updated successfully!');
        navigate('/users'); // Ro'yxatga qaytish
      } else {
        console.error('Failed to update user');
        setError('Foydalanuvchini yangilashda xatolik yuz berdi.');
        setIsSubmitting(false);
      }
    }, 1500);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (notFound) {
    return (
      <div className="p-6 text-center text-red-500">
         Foydalanuvchi (ID: {userId}) topilmadi.
         <Link to="/users" className="block mt-4 text-blue-600 hover:underline">Ro'yxatga qaytish</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Foydalanuvchini Tahrirlash (ID: {userId})</h1>

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

         {/* Parolni tahrirlash uchun alohida bo'lim yoki funksiya qo'shish mumkin */}
         {/* Masalan: <Link to={`/users/change-password/${userId}`}>Parolni o'zgartirish</Link> */}

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
            {isSubmitting ? 'Yangilanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserEditPage;