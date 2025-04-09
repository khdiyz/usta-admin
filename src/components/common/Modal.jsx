import React from 'react';
import { FaTimes, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaQuestionCircle } from 'react-icons/fa';

function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Tasdiqlash',
  cancelText = 'Bekor qilish',
  onConfirm,
  onCancel,
  hideCancelButton = false,
}) {
  if (!isOpen) return null;

  const Icon = () => {
    // ... (Icon komponenti o'zgarishsiz qoladi) ...
    switch (type) {
      case 'success': return <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" size={22} />;
      case 'error': return <FaExclamationTriangle className="text-red-500 mr-3 flex-shrink-0" size={22} />;
      case 'confirm': return <FaQuestionCircle className="text-blue-500 mr-3 flex-shrink-0" size={22} />;
      case 'info':
      default: return <FaInfoCircle className="text-blue-500 mr-3 flex-shrink-0" size={22} />;
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancelClick();
    }
  };

  const handleConfirmClick = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancelClick = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div
       // ---- O'zgarishlar shu yerda ----
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-20 backdrop-blur-sm p-4 transition-opacity duration-300 ease-in-out"
      // ---- bg-opacity-50 -> bg-opacity-20, backdrop-blur-sm qo'shildi ----
      onClick={handleOverlayClick}
    >
      {/* ---- O'zgarishlar shu yerda ---- */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden transform transition-all duration-300 ease-in-out scale-100">
      {/* ---- max-w-md -> max-w-sm ---- */}

        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-200"> {/* items-start qo'shildi ikonka uzun sarlavha bilan to'g'ri turishi uchun */}
          <div className="flex items-center">
             <Icon />
             {/* Sarlavha uzun bo'lsa o'ralishi uchun */}
             <h3 className="text-lg font-semibold text-gray-800 break-words">{title || (type === 'confirm' ? 'Tasdiqlash' : 'Xabar')}</h3>
          </div>
          <button onClick={handleCancelClick} className="text-gray-400 hover:text-gray-600 ml-3 cursor-pointer"> {/* Chapdan ozroq joy */}
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-sm text-gray-700 leading-relaxed"> {/* Matn rangi va qatorlar orasidagi masofa biroz o'zgartirildi */}
          {message}
        </div>

        {/* Footer (Buttons) */}
        <div className="flex justify-end p-4 bg-gray-50 border-t border-gray-200 space-x-3">
          {!hideCancelButton && (
             <button
              onClick={handleCancelClick}
              className="py-2 px-4 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-150 ease-in-out text-sm cursor-pointer" // text-sm qo'shildi
            >
              {cancelText}
            </button>
          )}
          {(type === 'confirm' || !hideCancelButton) && (
             <button
              onClick={handleConfirmClick}
              className={`py-2 px-4 rounded text-white transition duration-150 ease-in-out text-sm cursor-pointer ${ // text-sm qo'shildi
                type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                type === 'confirm' ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-black hover:bg-gray-800'
              }`}
            >
              {type === 'confirm' ? confirmText : 'OK'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;