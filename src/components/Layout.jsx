// src/components/Layout.jsx (taxminiy)
import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom'; // Kontentni joylash uchun

function Layout() {
  return (
    <div className="flex h-screen bg-gray-100"> {/* Minimal oq-kulrang fon */}
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6"> {/* Asosiy kontent maydoni */}
        <Outlet /> {/* Bu yerda joriy routening komponenti ko'rsatiladi */}
      </main>
    </div>
  );
}

export default Layout;