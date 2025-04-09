import React from 'react';

function HomePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Panelga Xush Kelibsiz!</h1>
      <p className="text-gray-600">
        Bu boshqaruv panelining asosiy sahifasi. Kerakli bo'limni yon panel (sidebar) orqali tanlashingiz mumkin.
      </p>
      {/* Kelajakda bu yerga statistik ma'lumotlar yoki tezkor havolalar qo'shilishi mumkin */}
      <div className="mt-8 p-4 border border-gray-300 rounded bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-700">Tezkor Ma'lumot (Namuna)</h2>
        <p className="mt-2 text-gray-600">Foydalanuvchilar soni: ...</p>
        <p className="text-gray-600">Yangi buyurtmalar: ...</p>
      </div>
    </div>
  );
}

export default HomePage;