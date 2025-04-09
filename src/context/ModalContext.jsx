import React, { createContext, useState, useContext, useCallback } from 'react';
import Modal from '../components/common/Modal'; // Modal komponentini import qilish

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Tasdiqlash',
    cancelText: 'Bekor qilish',
    onConfirm: null,
    onCancel: null,
    hideCancelButton: false,
  });

  const showModal = useCallback((config) => {
    setModalState({
      isOpen: true,
      title: config.title || '',
      message: config.message || '',
      type: config.type || 'info',
      confirmText: config.confirmText || (config.type === 'confirm' ? 'Tasdiqlash' : 'OK'),
      cancelText: config.cancelText || 'Bekor qilish',
      onConfirm: config.onConfirm || null, // Callbackni saqlash
      onCancel: config.onCancel || null,  // Callbackni saqlash
      hideCancelButton: config.type !== 'confirm', // Confirm bo'lmasa cancelni yashirish (OK tugmasi uchun)
      ...config, // Boshqa configlarni ham qabul qilish
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState((prevState) => ({
      ...prevState,
      isOpen: false,
      // Callbacklarni tozalash shart emas, lekin xohlasangiz:
      // onConfirm: null,
      // onCancel: null,
    }));
  }, []);

  // Bu funksiyalar Modal komponentiga prop sifatida uzatiladi
  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm(); // Saqlangan callbackni chaqirish
    }
    hideModal(); // Modalni yopish
  };

  const handleCancel = () => {
     if (modalState.onCancel) {
      modalState.onCancel(); // Saqlangan callbackni chaqirish
    }
    hideModal(); // Modalni yopish
  };


  const value = { showModal, hideModal }; // Faqat shu funksiyalarni export qilamiz

  return (
    <ModalContext.Provider value={value}>
      {children}
      {/* Modal komponentini shu yerda render qilamiz, u doim DOMda bo'ladi */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal} // Overlay yoki X bosilsa yopish uchun
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={handleConfirm} // Ichki handleConfirm'ni uzatish
        onCancel={handleCancel}   // Ichki handleCancel'ni uzatish
        hideCancelButton={modalState.hideCancelButton}
      />
    </ModalContext.Provider>
  );
};

// Contextni ishlatish uchun custom hook
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};