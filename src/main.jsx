import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css'; // Tailwind CSS

// Auth Provider
import { AuthProvider } from './context/AuthContext'; // AuthProvider importi
import { ModalProvider } from './context/ModalContext';

// Komponentlar
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; // Himoyalangan marshrut komponenti
import LoginPage from './pages/LoginPage';             // Login sahifasi
import HomePage from './pages/HomePage';
import UserListPage from './pages/users/UserListPage';
import UserCreatePage from './pages/users/UserCreatePage';
import UserEditPage from './pages/users/UserEditPage';
import MasterListPage from './pages/masters/MasterListPage';
import MasterCreatePage from './pages/masters/MasterCreatePage';
import ClientListPage from './pages/clients/ClientListPage';
import ClientCreatePage from './pages/clients/ClientCreatePage';
import ClientEditPage from './pages/clients/ClientEditPage';
import CountryListPage from './pages/countries/CountryListPage';
import CountryCreatePage from './pages/countries/CountryCreatePage';
import CountryEditPage from './pages/countries/CountryEditPage';
import RegionListPage from './pages/regions/RegionListPage';
import RegionCreatePage from './pages/regions/RegionCreatePage';
import RegionEditPage from './pages/regions/RegionEditPage';
import DistrictListPage from './pages/districts/DistrictListPage';
import DistrictCreatePage from './pages/districts/DistrictCreatePage';
import DistrictEditPage from './pages/districts/DistrictEditPage';
import CategoryListPage from './pages/categories/CategoryListPage';
import CategoryCreatePage from './pages/categories/CategoryCreatePage';
import CategoryEditPage from './pages/categories/CategoryEditPage';
import ServiceListPage from './pages/services/ServiceListPage';
import ServiceCreatePage from './pages/services/ServiceCreatePage';
import ServiceEditPage from './pages/services/ServiceEditPage';
import NotFoundPage from './pages/NotFoundPage';
import MasterEditPage from './pages/masters/MasterEditPage';

const router = createBrowserRouter([
  {
    path: '/login', // Login sahifasi uchun alohida marshrut
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute> {/* Admin panelni himoyalash */}
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      // Foydalanuvchilar qismi
      {
        path: 'users',
        children: [
          { index: true, element: <UserListPage /> },
          { path: 'create', element: <UserCreatePage /> },
          { path: 'edit/:userId', element: <UserEditPage /> },
        ],
      },
      // Ustalar qismi
      {
        path: 'masters',
        children: [
          { index: true, element: <MasterListPage /> },
          { path: 'create', element: <MasterCreatePage /> },
          { path: 'edit/:masterId', element: <MasterEditPage /> }, // To'ldirilishi kerak
        ],
      },
      // Mijozlar qismi
      {
        path: 'clients',
        children: [
          { index: true, element: <ClientListPage /> },
          { path: 'create', element: <ClientCreatePage /> },
          { path: 'edit/:clientId', element: <ClientEditPage /> },
        ],
      },
      {
        path: 'categories',
        children: [
          { index: true, element: <CategoryListPage /> },
          { path: 'create', element: <CategoryCreatePage /> },
          { path: 'edit/:categoryId', element: <CategoryEditPage /> },
        ],
      },
      {
        path: 'services',
        children: [
          { index: true, element: <ServiceListPage /> },
          { path: 'create', element: <ServiceCreatePage /> },
          { path: 'edit/:serviceId', element: <ServiceEditPage /> },
        ],
      },
      {
        path: 'countries',
        children: [
          {
            index: true, // Asosiy /countries yo'li
            element: <CountryListPage />,
          },
          {
            path: 'create', // /countries/create
            element: <CountryCreatePage />,
          },
          {
            path: 'edit/:countryId', // /countries/edit/uuid-bu-yerda
            element: <CountryEditPage />,
          },
        ]
      },
      {
        path: 'regions',
        children: [
          { index: true, element: <RegionListPage /> },
          { path: 'create', element: <RegionCreatePage /> },
          { path: 'edit/:regionId', element: <RegionEditPage /> },
        ]
      },
      {
        path: 'districts',
        children: [
          { index: true, element: <DistrictListPage /> },
          { path: 'create', element: <DistrictCreatePage /> },
          { path: 'edit/:districtId', element: <DistrictEditPage /> },
        ]
      },
      // Boshqa himoyalangan marshrutlar...
    ],
  },
  {
    path: '*', // Boshqa barcha yo'llar uchun 404
    element: <NotFoundPage />,
     // Yoki 404 ni ham ProtectedRoute ichiga olish mumkin, agar kerak bo'lsa
  }
]);

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <Toaster
          position="top-center" // Pozitsiyasi
          reverseOrder={false}  // Yangilari tepadan chiqadi
          toastOptions={{
            duration: 1000, // Standart davomiylik (3 soniya)
            style: { // Umumiy stillar (ixtiyoriy)
              background: '#333',
              color: '#fff',
            },
            success: { // Muvaffaqiyat uchun stillar
              duration: 1000,
              style: {
                background: '#28a745', // Yashil fon
                color: 'white',
              },
              iconTheme: { // Ikonka rangi
                  primary: 'white',
                  secondary: '#28a745',
              },
            },
            error: { // Xatolik uchun stillar
              duration: 1000, // Xatolikni ko'proq ushlab turish ham mumkin (masalan 5000)
              style: {
                background: '#dc3545', // Qizil fon
                color: 'white',
              },
               iconTheme: { // Ikonka rangi
                   primary: 'white',
                   secondary: '#dc3545',
               },
            },
          }}
        />
        <RouterProvider router={router} /> {/* Yoki <App /> agar boshqacha struktura bo'lsa */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </ModalProvider>
    </QueryClientProvider>
  </AuthProvider>
);