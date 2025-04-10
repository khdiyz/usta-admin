import React from 'react';
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from 'react-icons/fa';

const generatePageNumbers = (currentPage, totalPages, maxVisiblePages = 7) => {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const sidePages = Math.floor((maxVisiblePages - 3) / 2);
  const leftEllipsis = currentPage > sidePages + 2;
  const rightEllipsis = currentPage < totalPages - sidePages - 1;

  let pages = [1];

  if (leftEllipsis) {
    pages.push('...');
  }

  const startPage = leftEllipsis ? Math.max(2, currentPage - sidePages) : 2;
  const endPage = rightEllipsis ? Math.min(totalPages - 1, currentPage + sidePages) : totalPages - 1;

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (rightEllipsis) {
    pages.push('...');
  }

  pages.push(totalPages);

  return [...new Set(pages)];
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center space-x-1 mt-4">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaAngleDoubleLeft size={16} />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaAngleLeft size={16} />
      </button>

      {pageNumbers.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...' || page === currentPage}
          className={`px-3 py-1 rounded-md ${
            page === currentPage
              ? 'bg-black text-white'
              : 'text-gray-500 hover:bg-gray-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaAngleRight size={16} />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaAngleDoubleRight size={16} />
      </button>
    </div>
  );
};

export default Pagination; 