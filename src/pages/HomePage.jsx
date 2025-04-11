import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function HomePage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [stats, setStats] = useState({
    totalMasters: 0,
    totalClients: 0,
    totalServices: 0,
    totalCategories: 0,
    totalApplications: 0,
    totalProposals: 0
  });
  const [clientRegistrations, setClientRegistrations] = useState([]);
  const [masterRegistrations, setMasterRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics
        const statsResponse = await fetch(`${API_URL}/statistics/dashboard`, {
          headers: {
            'accept': 'application/json'
          }
        });
        
        if (!statsResponse.ok) {
          throw new Error('Statistika ma\'lumotlarini olishda xatolik yuz berdi');
        }
        
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // Fetch client registrations
        const clientResponse = await fetch(`${API_URL}/statistics/client-registrations`, {
          headers: {
            'accept': 'application/json'
          }
        });
        
        if (!clientResponse.ok) {
          throw new Error('Mijozlar ro\'yxatini olishda xatolik yuz berdi');
        }
        
        const clientData = await clientResponse.json();
        setClientRegistrations(clientData);
        
        // Fetch master registrations
        const masterResponse = await fetch(`${API_URL}/statistics/master-registrations`, {
          headers: {
            'accept': 'application/json'
          }
        });
        
        if (!masterResponse.ok) {
          throw new Error('Ustalar ro\'yxatini olishda xatolik yuz berdi');
        }
        
        const masterData = await masterResponse.json();
        setMasterRegistrations(masterData);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  // Prepare data for client registration chart
  const clientChartData = {
    labels: clientRegistrations.map(item => item.date),
    datasets: [
      {
        label: 'Mijozlar ro\'yxati',
        data: clientRegistrations.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.1
      }
    ]
  };

  // Prepare data for master registration chart
  const masterChartData = {
    labels: masterRegistrations.map(item => item.date),
    datasets: [
      {
        label: 'Ustalar ro\'yxati',
        data: masterRegistrations.map(item => item.count),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        tension: 0.1
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Panelga Xush Kelibsiz!</h1>
      <p className="text-gray-600">
        Bu boshqaruv panelining asosiy sahifasi. Kerakli bo'limni yon panel (sidebar) orqali tanlashingiz mumkin.
      </p>
      
      <div className="mt-8 p-4 border border-gray-300 rounded bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-700">Tizim Statistikasi</h2>
        
        {loading && (
          <p className="mt-2 text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        )}
        
        {error && (
          <p className="mt-2 text-red-600">{error}</p>
        )}
        
        {!loading && !error && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-600">Ustalar</h3>
              <p className="text-2xl font-bold">{stats.totalMasters}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-600">Mijozlar</h3>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-600">Xizmatlar</h3>
              <p className="text-2xl font-bold">{stats.totalServices}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-600">Kategoriyalar</h3>
              <p className="text-2xl font-bold">{stats.totalCategories}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-600">Arizalar</h3>
              <p className="text-2xl font-bold">{stats.totalApplications}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-600">Takliflar</h3>
              <p className="text-2xl font-bold">{stats.totalProposals}</p>
            </div>
          </div>
        )}
      </div>
      
      {!loading && !error && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-300 rounded bg-white shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Mijozlar ro'yxatdan o'tish statistikasi</h2>
            {clientRegistrations.length > 0 ? (
              <Line data={clientChartData} options={chartOptions} />
            ) : (
              <p className="text-gray-600">Ma'lumot mavjud emas</p>
            )}
          </div>
          
          <div className="p-4 border border-gray-300 rounded bg-white shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Ustalar ro'yxatdan o'tish statistikasi</h2>
            {masterRegistrations.length > 0 ? (
              <Line data={masterChartData} options={chartOptions} />
            ) : (
              <p className="text-gray-600">Ma'lumot mavjud emas</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;