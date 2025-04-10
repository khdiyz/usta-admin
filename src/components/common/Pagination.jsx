import React from 'react';
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from 'react-icons/fa';

const generatePageNumbers = (currentPage, totalPages, maxVisiblePages = 10) => {
  // Always show pages 1-10 (or up to totalPages if less than 10)
  const pagesToShow = Math.min(totalPages, maxVisiblePages);
  return Array.from({ length: pagesToShow }, (_, i) => i + 1);
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Ensure totalPages is at least 1
  const effectiveTotalPages = Math.max(1, totalPages);
  const pageNumbers = generatePageNumbers(currentPage, effectiveTotalPages);

  return (
    <div className="flex items-center justify-center space-x-1 mt-4">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FaAngleDoubleLeft size={16} />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FaAngleLeft size={16} />
      </button>

      {pageNumbers.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...' || page === currentPage}
          className={`px-3 py-1 rounded-md cursor-pointer ${
            page === currentPage
              ? 'bg-black text-white'
              : 'text-gray-600 hover:bg-gray-100'
          } disabled:opacity-80`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === effectiveTotalPages}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FaAngleRight size={16} />
      </button>
      <button
        onClick={() => onPageChange(effectiveTotalPages)}
        disabled={currentPage === effectiveTotalPages}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FaAngleDoubleRight size={16} />
      </button>
    </div>
  );
};

export default Pagination; 