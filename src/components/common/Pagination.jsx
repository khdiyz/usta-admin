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

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return [...new Set(pages)];
};

const Pagination = ({ currentPage, totalPages, onPageChange, totalCount }) => {
  // Ensure totalPages is at least 1
  const effectiveTotalPages = Math.max(1, totalPages);
  const pageNumbers = generatePageNumbers(currentPage, effectiveTotalPages);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm space-y-2 sm:space-y-0">
      <p className="text-gray-600">
        Jami: {totalCount} ta {effectiveTotalPages > 1 ? `(Sahifa ${currentPage} / ${effectiveTotalPages})` : ''}
      </p>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Birinchi sahifa"
        >
          <FaAngleDoubleLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Oldingi sahifa"
        >
          <FaAngleLeft size={16} />
        </button>

        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-1 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                disabled={page === currentPage}
                className={`py-1 px-3 rounded border border-gray-300 transition-colors duration-150 ease-in-out ${
                  page === currentPage
                    ? 'bg-black text-white border-black cursor-default'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === effectiveTotalPages}
          className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Keyingi sahifa"
        >
          <FaAngleRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(effectiveTotalPages)}
          disabled={currentPage === effectiveTotalPages}
          className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Oxirgi sahifa"
        >
          <FaAngleDoubleRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination; 