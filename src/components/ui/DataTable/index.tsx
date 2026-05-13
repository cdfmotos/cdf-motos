import React from 'react';
import { ArrowDownAZ, ArrowUpZA, ArrowUpDown, Search } from 'lucide-react';
import type { DataTableProps } from './types/types';
import { useDataTable } from './hooks/useDataTable';
import { DataTablePagination } from './components/DataTablePagination';

export function DataTable<T>({ 
  data, 
  columns, 
  searchable = true,
  searchPlaceholder = "Buscar...",
  pagination = true,
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 20, 50]
}: DataTableProps<T>) {
  
  const {
    searchTerm,
    handleSearch,
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    totalPages,
    totalItems,
    paginatedData
  } = useDataTable({ data, defaultRowsPerPage });

  const displayData = pagination ? paginatedData : data; // Si pagination es false, ignora la paginación local (ideal para si queremos renderizar todo)

  return (
    <div className="w-full">
      {searchable && (
        <div className="mb-4 relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-slate-700"
          />
        </div>
      )}
      
      <div className="overflow-x-auto rounded-lg border border-border flex flex-col bg-white">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-border sticky top-0 z-10">
              <tr>
                {columns.map((col, index) => (
                  <th 
                    key={index} 
                    scope="col" 
                    className={`px-6 py-4 font-semibold ${col.sortable !== false ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''}`}
                    onClick={() => col.sortable !== false && handleSort(col.accessorKey)}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable !== false && (
                        <span className="text-slate-400">
                          {sortConfig?.key === col.accessorKey ? (
                            sortConfig.direction === 'asc' ? <ArrowDownAZ className="w-4 h-4 text-primary" /> : <ArrowUpZA className="w-4 h-4 text-primary" />
                          ) : (
                            <ArrowUpDown className="w-4 h-4 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.length > 0 ? (
                displayData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="bg-white border-b border-border hover:bg-slate-50/50 transition-colors last:border-b-0">
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                        {col.cell 
                          ? col.cell(row) 
                          : (row[col.accessorKey as keyof T] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500 bg-white">
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {pagination && (
          <DataTablePagination 
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
            rowsPerPageOptions={rowsPerPageOptions}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
