import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (key: string) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  pagination,
  sorting,
  loading = false,
  emptyMessage = 'No data available'
}) => {
  const handleSort = (key: string) => {
    if (sorting && sorting.onSort) {
      sorting.onSort(key);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sorting && (
                      <span className="text-gray-400">
                        {sorting.sortBy === column.key ? (
                          sorting.sortOrder === 'asc' ? '↑' : '↓'
                        ) : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {((pagination.currentPage - 1) * 10) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * 10, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.currentPage === 1}
                variant="outline"
                size="small"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                variant="outline"
                size="small"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = Math.max(1, pagination.currentPage - 2) + i;
                if (page > pagination.totalPages) return null;
                
                return (
                  <Button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    variant={page === pagination.currentPage ? 'primary' : 'outline'}
                    size="small"
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                variant="outline"
                size="small"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => pagination.onPageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                variant="outline"
                size="small"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;