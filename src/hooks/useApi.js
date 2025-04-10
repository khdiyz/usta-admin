import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const useApi = () => {
  const { token } = useAuth();

  const makeApiCall = useCallback(async (url, options = {}) => {
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
  }, [token]);

  const fetchData = useCallback(async (url, page = 1, limit = 10) => {
    try {
      const result = await makeApiCall(`${url}?limit=${limit}&page=${page}`, { method: 'GET' });
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
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
      throw err;
    }
  }, [makeApiCall]);

  const deleteData = useCallback(async (url, id, name) => {
    const toastId = toast.loading("O'chirilmoqda...");
    try {
      await makeApiCall(`${url}/${id}`, { method: 'DELETE' });
      toast.success(`'${name?.uz || id}' muvaffaqiyatli o'chirildi.`, { id: toastId });
      return true;
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
      toast.error(`O'chirishda xatolik: ${err.message}`, { id: toastId });
      throw err;
    }
  }, [makeApiCall]);

  return {
    makeApiCall,
    fetchData,
    deleteData
  };
};

export default useApi; 