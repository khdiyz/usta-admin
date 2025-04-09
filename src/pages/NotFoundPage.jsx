import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-4 mb-8">Kechirasiz, siz qidirayotgan sahifa topilmadi.</p>
      <Link
        to="/"
        className="bg-black hover:bg-gray-800 text-white py-2 px-6 rounded transition duration-150 ease-in-out"
      >
        Bosh Sahifaga Qaytish
      </Link>
    </div>
  );
}

export default NotFoundPage;