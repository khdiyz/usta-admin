import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';
import useClientQueries from '../../hooks/useClientQueries';
import toast from 'react-hot-toast';

function ClientCreatePage() {
  const navigate = useNavigate();
  const { showModal } = useModal();
  
  // Use TanStack Query hooks
  const {
    useCountries,
    useRegions,
    useDistricts,
    useCreateClient,
    useUploadProfilePhoto
  } = useClientQueries();
  
  // Query hooks
  const { data: countries = [] } = useCountries();
  
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    profilePhoto: null,
    turonId: '',
    location: {
      countryId: '',
      regionId: '',
      districtId: ''
    }
  });
  
  // Dependent queries based on form selections
  const { data: regions = [] } = useRegions(formData.location.countryId);
  const { data: districts = [] } = useDistricts(formData.location.regionId);
  
  // Mutations
  const createClientMutation = useCreateClient();
  const uploadPhotoMutation = useUploadProfilePhoto();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
      
      // Reset child selections when parent changes
      if (child === 'countryId') {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, regionId: '', districtId: '' }
        }));
      } else if (child === 'regionId') {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, districtId: '' }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      try {
        const fileId = await uploadPhotoMutation.mutateAsync(file);
        if (fileId) {
          setFormData(prev => ({ ...prev, profilePhoto: fileId }));
          toast.success('Profil rasmi muvaffaqiyatli yuklandi!');
        }
      } catch (error) {
        setProfilePhotoPreview(null);
        // Error handling is in the mutation hook
      }
    }
  };

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error('Barcha majburiy maydonlarni to\'ldiring');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || "",
        phone: formData.phone,
        profilePhoto: formData.profilePhoto,
        turonId: formData.turonId ? parseInt(formData.turonId, 10) : undefined,
        location: {
          countryId: formData.location.countryId || undefined,
          regionId: formData.location.regionId || undefined,
          districtId: formData.location.districtId || undefined
        }
      };
      
      // Remove undefined properties for clean API request
      if (!payload.turonId) delete payload.turonId;
      if (!payload.location.countryId) delete payload.location.countryId;
      if (!payload.location.regionId) delete payload.location.regionId;
      if (!payload.location.districtId) delete payload.location.districtId;
      if (Object.keys(payload.location).length === 0) delete payload.location;
      
      await createClientMutation.mutateAsync(payload);
      navigate('/clients');
    } catch (error) {
      // Error handling is in the mutation hook
      console.error('Mijozni yaratishda xatolik:', error);
    }
  };

  const handleCancel = () => {
    showModal({
      type: 'confirm',
      title: 'Sahifadan chiqish',
      message: 'Siz kiritgan ma\'lumotlar saqlanmagan. Rostdan ham sahifadan chiqmoqchimisiz?',
      confirmText: 'Ha, chiqish',
      cancelText: 'Yo\'q, qolish',
      onConfirm: () => navigate('/clients')
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Yangi mijoz qo'shish</h1>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out"
        >
          <FaArrowLeft className="mr-2" /> Orqaga
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Shaxsiy ma'lumotlar */}
          <div className="space-y-4 md:col-span-2">
            <h2 className="text-lg font-medium text-gray-700 border-b pb-2">Shaxsiy ma'lumotlar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Ism *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Familiya *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">Otasining ismi</label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefon raqami *</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+998 XX XXX XX XX"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="turonId" className="block text-sm font-medium text-gray-700">Turon ID</label>
                <input
                  type="number"
                  id="turonId"
                  name="turonId"
                  value={formData.turonId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                />
              </div>
            </div>
          </div>
          
          {/* Profil rasmi */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700 border-b pb-2">Profil rasmi</h2>
            
            <div className="flex flex-col items-center justify-center">
              <div className="w-32 h-32 relative mb-4">
                {profilePhotoPreview ? (
                  <img
                    src={profilePhotoPreview}
                    alt="Profil rasmi"
                    className="w-full h-full object-cover rounded-full border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full border-4 border-gray-200 text-gray-400">
                    {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
                
                {uploadPhotoMutation.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="loader"></div>
                  </div>
                )}
              </div>
              
              <label className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded text-sm cursor-pointer transition duration-150 ease-in-out">
                Rasmni tanlash
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  disabled={uploadPhotoMutation.isPending}
                />
              </label>
            </div>
          </div>
          
          {/* Manzil */}
          <div className="space-y-4 md:col-span-3">
            <h2 className="text-lg font-medium text-gray-700 border-b pb-2">Manzil</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="countryId" className="block text-sm font-medium text-gray-700">Davlat</label>
                <select
                  id="countryId"
                  name="location.countryId"
                  value={formData.location.countryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                >
                  <option value="">Tanlang...</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name?.uz || country.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="regionId" className="block text-sm font-medium text-gray-700">Viloyat</label>
                <select
                  id="regionId"
                  name="location.regionId"
                  value={formData.location.regionId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                  disabled={!formData.location.countryId}
                >
                  <option value="">Tanlang...</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>
                      {region.name?.uz || region.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="districtId" className="block text-sm font-medium text-gray-700">Tuman</label>
                <select
                  id="districtId"
                  name="location.districtId"
                  value={formData.location.districtId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                  disabled={!formData.location.regionId}
                >
                  <option value="">Tanlang...</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name?.uz || district.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-white border border-gray-300 text-gray-700 mr-4 py-2 px-4 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            disabled={createClientMutation.isPending || uploadPhotoMutation.isPending}
            className="bg-black text-white py-2 px-4 rounded shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex items-center"
          >
            {createClientMutation.isPending ? (
              <>
                <span className="mr-2">Saqlanmoqda...</span>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
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
  );
}

export default ClientCreatePage; 