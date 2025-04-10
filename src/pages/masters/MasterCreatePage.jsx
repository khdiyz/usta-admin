import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

function MasterCreatePage() {
  const navigate = useNavigate();
  const { showModal } = useModal();
  const { makeApiCall } = useApi();
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const FILE_URL = import.meta.env.VITE_FILE_URL;
  
  const [loading, setLoading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingWorkPhotos, setUploadingWorkPhotos] = useState({}); // Track upload status per index
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    profilePhoto: null, // Store ID here
    turonId: '',
    experience: {
      years: 0,
      months: 0
    },
    location: {
      countryId: '',
      regionId: '',
      districtId: ''
    },
    serviceIds: [],
    workPhotos: [] // Store IDs here
  });
  
  // State to manage work photo inputs (file objects and previews)
  const [workPhotoInputs, setWorkPhotoInputs] = useState([{ id: null, file: null, previewUrl: null, uploading: false }]);

  // Load countries and categories on initial render
  useEffect(() => {
    fetchCountries();
    fetchCategories();
  }, []);

  // Load regions when country changes
  useEffect(() => {
    if (formData.location.countryId) {
      fetchRegions(formData.location.countryId);
    }
  }, [formData.location.countryId]);

  // Load districts when region changes
  useEffect(() => {
    if (formData.location.regionId) {
      fetchDistricts(formData.location.regionId);
    }
  }, [formData.location.regionId]);

  const fetchCountries = async () => {
    setLoadingLocation(true);
    try {
      const result = await makeApiCall(`${API_URL}/countries`, { method: 'GET' });
      setCountries(result.data || []);
    } catch (error) {
      toast.error('Davlatlarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const fetchRegions = async (countryId) => {
    setLoadingLocation(true);
    try {
      const result = await makeApiCall(`${API_URL}/regions?countryId=${countryId}`, { method: 'GET' });
      setRegions(result.data || []);
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, regionId: '', districtId: '' }
      }));
      setDistricts([]);
    } catch (error) {
      toast.error('Viloyatlarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const fetchDistricts = async (regionId) => {
    setLoadingLocation(true);
    try {
      const result = await makeApiCall(`${API_URL}/districts?regionId=${regionId}`, { method: 'GET' });
      setDistricts(result.data || []);
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, districtId: '' }
      }));
    } catch (error) {
      toast.error('Tumanlarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingServices(true);
    try {
      const result = await makeApiCall(`${API_URL}/categories`, { method: 'GET' });
      const categoriesData = result.data || [];
      setCategories(categoriesData);
      
      // For each category, fetch its services
      await Promise.all(categoriesData.map(category => fetchServicesByCategory(category.id)));
    } catch (error) {
      toast.error('Kategoriyalarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchServicesByCategory = async (categoryId) => {
    try {
      const result = await makeApiCall(`${API_URL}/services?categoryId=${categoryId}`, { method: 'GET' });
      setServicesByCategory(prev => ({
        ...prev,
        [categoryId]: result.data || []
      }));
    } catch (error) {
      toast.error(`${categoryId} kategoriyasi uchun xizmatlarni yuklashda xatolik: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setFormData(prev => ({
      ...prev,
      serviceIds: e.target.checked
        ? [...prev.serviceIds, serviceId]
        : prev.serviceIds.filter(id => id !== serviceId)
    }));
  };

  // File upload function using direct fetch instead of makeApiCall
  const uploadFile = async (file) => {
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    try {
      const response = await fetch('http://localhost:4040/api/v1/admin/files', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
          // Note: don't set Content-Type, browser will set it with boundary for FormData
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error(`Fayl yuklashda xatolik: ${response.statusText}`);
      }

      const data = await response.json();
      if (data && data.id) {
        return data.id;
      } else {
        throw new Error('Fayl ID olinmadi');
      }
    } catch (error) {
      console.error('Fayl yuklash xatosi:', error);
      toast.error(`Fayl yuklashda xatolik: ${error.message}`);
      return null;
    }
  };

  // Profile Photo Change Handler
  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setUploadingProfile(true);
      try {
        const fileId = await uploadFile(file);
        if (fileId) {
          setFormData(prev => ({ ...prev, profilePhoto: fileId }));
          toast.success('Profil rasmi muvaffaqiyatli yuklandi!');
        } else {
          throw new Error('Rasm yuklanmadi');
        }
      } catch (error) {
        setProfilePhotoPreview(null);
        toast.error(`Rasm yuklashda xatolik: ${error.message}`);
      } finally {
        setUploadingProfile(false);
      }
    }
  };

  // Work Photo Change Handler
  const handleWorkPhotoChange = async (index, e) => {
    const file = e.target.files[0];
    if (file) {
      // Update local state for immediate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setWorkPhotoInputs(prevInputs => {
          const newInputs = [...prevInputs];
          newInputs[index] = { ...newInputs[index], file: file, previewUrl: reader.result };
          return newInputs;
        });
      };
      reader.readAsDataURL(file);

      // Set uploading status for this specific photo
      setWorkPhotoInputs(prevInputs => {
        const newInputs = [...prevInputs];
        newInputs[index] = { ...newInputs[index], uploading: true };
        return newInputs;
      });

      try {
        const fileId = await uploadFile(file);
        
        // Update state with the ID and reset uploading status
        setWorkPhotoInputs(prevInputs => {
          const newInputs = [...prevInputs];
          if (fileId) {
            newInputs[index] = { 
              ...newInputs[index], 
              id: fileId, 
              uploading: false 
            };
            toast.success(`${index + 1}-rasm muvaffaqiyatli yuklandi!`);
          } else {
            // Reset if upload failed
            newInputs[index] = { 
              ...newInputs[index], 
              id: null, 
              uploading: false 
            };
            toast.error(`${index + 1}-rasmni yuklashda xatolik.`);
          }
          return newInputs;
        });
      } catch (error) {
        // Reset on error
        setWorkPhotoInputs(prevInputs => {
          const newInputs = [...prevInputs];
          newInputs[index] = { 
            ...newInputs[index], 
            id: null, 
            uploading: false 
          };
          return newInputs;
        });
        toast.error(`${index + 1}-rasmni yuklashda xatolik: ${error.message}`);
      }
    }
  };

  const addWorkPhoto = () => {
    setWorkPhotoInputs(prev => [...prev, { id: null, file: null, previewUrl: null, uploading: false }]);
  };

  const removeWorkPhoto = (index) => {
    setWorkPhotoInputs(prev => prev.filter((_, i) => i !== index));
    // If it becomes empty, add a default empty input
    if (workPhotoInputs.length === 1) {
      setWorkPhotoInputs([{ id: null, file: null, previewUrl: null, uploading: false }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.location.countryId || !formData.location.regionId || !formData.location.districtId || formData.serviceIds.length === 0) {
      toast.error('Iltimos, barcha yulduzchali (*) maydonlarni to\'ldiring.');
      return;
    }

    // Get uploaded work photo IDs, filtering out any nulls (failed uploads or empty inputs)
    const uploadedWorkPhotoIds = workPhotoInputs
      .map(input => input.id)
      .filter(id => id !== null);

    const dataToSubmit = {
      ...formData,
      profilePhoto: formData.profilePhoto, // Already contains the ID or null
      workPhotos: uploadedWorkPhotoIds, // Send only the array of IDs
      turonId: parseInt(formData.turonId, 10) || 0,
      experience: {
        years: parseInt(formData.experience.years, 10) || 0,
        months: parseInt(formData.experience.months, 10) || 0
      },
    };

    setLoading(true);
    try {
      await makeApiCall(`${API_URL}/masters`, {
        method: 'POST',
        body: JSON.stringify(dataToSubmit),
        headers: { 'Content-Type': 'application/json' } // Explicitly set for JSON body
      });

      toast.success('Usta muvaffaqiyatli yaratildi');
      navigate('/masters');
    } catch (error) {
      toast.error(`Ustani yaratishda xatolik: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    showModal({
      type: 'confirm',
      title: 'Bekor qilishni tasdiqlang',
      message: 'Siz kiritgan barcha ma\'lumotlar yo\'qoladi. Davom etishni istaysizmi?',
      confirmText: 'Ha, bekor qilish',
      cancelText: 'Yo\'q, davom etish',
      onConfirm: () => navigate('/masters')
    });
  };

  // Helper function to get image display URL
  const getImageUrl = (fileId) => {
    return fileId ? `${FILE_URL}/${fileId}` : null;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Yangi usta qo'shish</h1>
        <button
          onClick={handleCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out"
        >
          <FaArrowLeft className="mr-2" /> Orqaga
        </button>
      </div>

      <div className="bg-white shadow-md rounded p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shaxsiy ma'lumotlar */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-700 border-b pb-2">Shaxsiy ma'lumotlar</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ism *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Familiya *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Otasining ismi</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon raqam *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+998901234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turon ID *</label>
                <input
                  type="number"
                  name="turonId"
                  value={formData.turonId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* Profile Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profil rasmi</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={uploadingProfile}
                  />
                  {uploadingProfile && <span className="text-sm text-gray-500">Yuklanmoqda...</span>}
                </div>
                
                {/* Display preview or actual uploaded image */}
                {(profilePhotoPreview || formData.profilePhoto) && (
                  <div className="mt-2 border rounded-md p-2 flex items-center">
                    <div className="w-16 h-16 border rounded overflow-hidden mr-3">
                      <img 
                        src={profilePhotoPreview || getImageUrl(formData.profilePhoto)} 
                        alt="Profil rasmi" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150?text=Rasm+topilmadi';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Rasm yuklandi</p>
                      {formData.profilePhoto && (
                        <p className="text-xs text-gray-500">ID: {formData.profilePhoto}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Joylashuv va tajriba */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-700 border-b pb-2">Joylashuv va tajriba</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Davlat *</label>
                <select
                  name="location.countryId"
                  value={formData.location.countryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loadingLocation || countries.length === 0}
                >
                  <option value="">Tanlang</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name?.uz || country.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Viloyat *</label>
                <select
                  name="location.regionId"
                  value={formData.location.regionId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loadingLocation || regions.length === 0 || !formData.location.countryId}
                >
                  <option value="">Tanlang</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>
                      {region.name?.uz || region.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tuman *</label>
                <select
                  name="location.districtId"
                  value={formData.location.districtId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loadingLocation || districts.length === 0 || !formData.location.regionId}
                >
                  <option value="">Tanlang</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name?.uz || district.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tajriba (yil)</label>
                  <input
                    type="number"
                    name="experience.years"
                    value={formData.experience.years}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tajriba (oy)</label>
                  <input
                    type="number"
                    name="experience.months"
                    value={formData.experience.months}
                    onChange={handleInputChange}
                    min="0"
                    max="11"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Xizmatlar */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-700 border-b pb-2 mb-4">Xizmatlar *</h2>
            
            {loadingServices ? (
              <p className="text-gray-500">Xizmatlar yuklanmoqda...</p>
            ) : categories.length === 0 ? (
              <p className="text-gray-500">Xizmatlar topilmadi.</p>
            ) : (
              <div className="space-y-6">
                {categories.map(category => (
                  <div key={category.id} className="border rounded-md p-4">
                    <h3 className="font-medium text-gray-700 mb-3">{category.name?.uz || category.name}</h3>
                    
                    {servicesByCategory[category.id]?.length ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {servicesByCategory[category.id].map(service => (
                          <div key={service.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`service-${service.id}`}
                              value={service.id}
                              checked={formData.serviceIds.includes(service.id)}
                              onChange={handleServiceChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-gray-700">
                              {service.name?.uz || service.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Bu kategoriyada xizmatlar mavjud emas.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Ish rasmlari */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-700 border-b pb-2 mb-4">Ish rasmlari</h2>
            
            {workPhotoInputs.map((input, index) => (
                <div key={index} className="mb-4">
                    <div className="flex items-center mb-2 space-x-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleWorkPhotoChange(index, e)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            disabled={input.uploading}
                        />
                        {input.uploading && <span className="text-sm text-gray-500">Yuklanmoqda...</span>}
                        <button
                            type="button"
                            onClick={() => removeWorkPhoto(index)}
                            className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400"
                            disabled={workPhotoInputs.length <= 1}
                            title="O'chirish"
                        >
                            <FaTimes />
                        </button>
                    </div>
                    
                    {/* Display preview or actual uploaded image */}
                    {(input.previewUrl || input.id) && (
                        <div className="border rounded-md p-2 flex items-center mt-1">
                            <div className="w-16 h-16 border rounded overflow-hidden mr-3">
                                <img 
                                    src={input.previewUrl || getImageUrl(input.id)} 
                                    alt={`Ish rasmi ${index + 1}`} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/150?text=Rasm+topilmadi';
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">Rasm yuklandi</p>
                                {input.id && (
                                    <p className="text-xs text-gray-500">ID: {input.id}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <button
              type="button"
              onClick={addWorkPhoto}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition"
            >
              + Yana rasm qo'shish
            </button>
          </div>
          
          {/* Submit button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white py-2 px-6 rounded inline-flex items-center transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Saqlash
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MasterCreatePage;
