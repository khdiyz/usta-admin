import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';

const getNestedValue = (obj, path) => {
  // Check if path is undefined or null
  if (!path) return '-';
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : '-';
  }, obj);
};

const Table = ({
  columns,
  data,
  onRowClick,
  onDelete,
  emptyMessage = "Ma'lumotlar topilmadi",
  rowNumber = false,
  pagination = null
}) => {
  return (
    <div className="bg-white shadow-md rounded overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {rowNumber && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                T/R
              </th>
            )}
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width ? `w-${column.width}` : ''}`}
              >
                {column.header}
              </th>
            ))}
            {onDelete && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amallar
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (rowNumber ? 1 : 0) + (onDelete ? 1 : 0)}
                className="px-6 py-4 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              // Always use index + 1 for the row number, regardless of pagination
              const rowNumberValue = index + 1;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-100 transition duration-150 ease-in-out ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(item.id)}
                >
                  {rowNumber && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {rowNumberValue}
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-${column.align || 'left'}`}
                    >
                      {column.cell 
                        ? column.cell(item)
                        : column.render 
                          ? column.render(item[column.field]) 
                          : getNestedValue(item, column.field)}
                    </td>
                  ))}
                  {onDelete && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                        title="O'chirish"
                        className="text-gray-600 hover:text-red-600 inline-block p-1 cursor-pointer"
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table; 