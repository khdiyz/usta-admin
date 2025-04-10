import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

const PageHeader = ({ title, createLink }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      {createLink && (
        <Link
          to={createLink}
          className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out"
        >
          <FaPlus className="mr-2" /> Yangi qo'shish
        </Link>
      )}
    </div>
  );
};

export default PageHeader; 