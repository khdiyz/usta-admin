import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4040/api/v1/admin';

export const useClientQueries = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Helper function to make API calls
  const makeApiCall = async (url, options = {}) => {
    if (!token) throw new Error("Autentifikatsiya tokeni topilmadi.");
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 204 && options.method === 'DELETE') {
          return null;
        }
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`API xatosi (${response.status}): ${errorData.message || 'Serverdan javob olishda xatolik'}`);
      }

      return response.status === 204 ? null : response.json();
    } catch (error) {
      console.error('API xatosi:', error);
      throw error;
    }
  };

  // Helper function for uploading files
  const uploadFile = async (file) => {
    if (!token) throw new Error("Autentifikatsiya tokeni topilmadi.");
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Fayl yuklashda xatolik: ${response.statusText}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Fayl yuklashda xatolik:', error);
      throw error;
    }
  };

  // Get clients with pagination
  const useClients = (page = 1, limit = 10) => {
    return useQuery({
      queryKey: ['clients', page, limit],
      queryFn: async () => {
        const result = await makeApiCall(`${API_URL}/clients?limit=${limit}&page=${page}`, { method: 'GET' });
        if (!result) {
          throw new Error('Serverdan javob olinmadi');
        }
        return {
          data: result.data || [],
          pagination: {
            page: result.pagination?.page || 1,
            pageCount: result.pagination?.pageCount || 1,
            totalCount: result.pagination?.totalCount || 0,
            limit
          }
        };
      },
      keepPreviousData: true, // Keep previous data while fetching new data
    });
  };

  // Get a single client by ID
  const useClient = (clientId) => {
    return useQuery({
      queryKey: ['client', clientId],
      queryFn: async () => {
        const result = await makeApiCall(`${API_URL}/clients/${clientId}`, { method: 'GET' });
        return result || null;
      },
      enabled: !!clientId, // Only run if clientId exists
    });
  };

  // Get countries
  const useCountries = () => {
    return useQuery({
      queryKey: ['countries'],
      queryFn: async () => {
        const result = await makeApiCall(`${API_URL}/countries`, { method: 'GET' });
        return result.data || [];
      },
      staleTime: 1000 * 60 * 60, // 1 hour (countries don't change often)
    });
  };

  // Get regions by countryId
  const useRegions = (countryId) => {
    return useQuery({
      queryKey: ['regions', countryId],
      queryFn: async () => {
        const result = await makeApiCall(`${API_URL}/regions?countryId=${countryId}`, { method: 'GET' });
        return result.data || [];
      },
      enabled: !!countryId, // Only run if countryId exists
      staleTime: 1000 * 60 * 60, // 1 hour
    });
  };

  // Get districts by regionId
  const useDistricts = (regionId) => {
    return useQuery({
      queryKey: ['districts', regionId],
      queryFn: async () => {
        const result = await makeApiCall(`${API_URL}/districts?regionId=${regionId}`, { method: 'GET' });
        return result.data || [];
      },
      enabled: !!regionId, // Only run if regionId exists
      staleTime: 1000 * 60 * 60, // 1 hour
    });
  };

  // Create a new client
  const useCreateClient = () => {
    return useMutation({
      mutationFn: async (clientData) => {
        return await makeApiCall(`${API_URL}/clients`, {
          method: 'POST',
          body: JSON.stringify(clientData),
        });
      },
      onSuccess: () => {
        toast.success('Mijoz muvaffaqiyatli yaratildi');
        queryClient.invalidateQueries({ queryKey: ['clients'] });
      },
      onError: (error) => {
        toast.error(`Xatolik: ${error.message}`);
      },
    });
  };

  // Update an existing client
  const useUpdateClient = () => {
    return useMutation({
      mutationFn: async ({ clientId, data }) => {
        return await makeApiCall(`${API_URL}/clients/${clientId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      },
      onSuccess: (_, variables) => {
        toast.success('Mijoz muvaffaqiyatli yangilandi');
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      },
      onError: (error) => {
        toast.error(`Xatolik: ${error.message}`);
      },
    });
  };

  // Delete a client
  const useDeleteClient = () => {
    return useMutation({
      mutationFn: async (clientId) => {
        return await makeApiCall(`${API_URL}/clients/${clientId}`, { method: 'DELETE' });
      },
      onSuccess: () => {
        toast.success(`Mijoz muvaffaqiyatli o'chirildi`);
        queryClient.invalidateQueries({ queryKey: ['clients'] });
      },
      onError: (error) => {
        toast.error(`O'chirishda xatolik: ${error.message}`);
      },
    });
  };

  // Upload profile photo
  const useUploadProfilePhoto = () => {
    return useMutation({
      mutationFn: uploadFile,
      onError: (error) => {
        toast.error(`Rasm yuklashda xatolik: ${error.message}`);
      },
    });
  };

  return {
    useClients,
    useClient,
    useCountries,
    useRegions,
    useDistricts,
    useCreateClient,
    useUpdateClient,
    useDeleteClient,
    useUploadProfilePhoto,
  };
};

export default useClientQueries; 