
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Edit3, Save, X } from 'lucide-react';

interface DataGridProps {
  data: any[];
  headers: string[];
  validationErrors: Array<{
    row: number;
    column: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

const DataGrid: React.FC<DataGridProps> = ({ data, headers, validationErrors }) => {
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const getCellError = (rowIndex: number, column: string) => {
    return validationErrors.find(error => error.row === rowIndex && error.column === column);
  };

  const handleCellEdit = (rowIndex: number, column: string, currentValue: any) => {
    setEditingCell({ row: rowIndex, column });
    setEditValue(String(currentValue || ''));
  };

  const handleSaveEdit = () => {
    // In a real app, you'd update the data here
    console.log('Saving edit:', editingCell, editValue);
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const paginatedData = data.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  if (data.length === 0) {
    return (
      <Card className="p-8 bg-slate-800/30 border-slate-700 text-center">
        <p className="text-slate-400">No data to display</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  #
                </th>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-slate-800/50 divide-y divide-slate-700">
              {paginatedData.map((row, rowIndex) => {
                const actualRowIndex = currentPage * rowsPerPage + rowIndex;
                return (
                  <tr key={actualRowIndex} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {actualRowIndex + 1}
                    </td>
                    {headers.map((header) => {
                      const cellError = getCellError(actualRowIndex, header);
                      const isEditing = editingCell?.row === actualRowIndex && editingCell?.column === header;
                      const cellValue = row[header];

                      return (
                        <td
                          key={header}
                          className={`px-4 py-3 text-sm relative ${
                            cellError
                              ? cellError.severity === 'error'
                                ? 'bg-red-500/10 border-l-2 border-red-500'
                                : 'bg-yellow-500/10 border-l-2 border-yellow-500'
                              : ''
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 text-xs bg-slate-700 border-slate-600"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSaveEdit}
                                className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="group flex items-center justify-between">
                              <span className="text-white truncate pr-2">
                                {String(cellValue || '')}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCellEdit(actualRowIndex, header, cellValue)}
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-slate-400 hover:text-white"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          
                          {cellError && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              {cellError.severity === 'error' ? (
                                <AlertCircle className="h-4 w-4 text-red-400" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                              )}
                            </div>
                          )}
                          
                          {cellError && (
                            <div className="absolute top-full left-0 mt-1 z-10 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              {cellError.message}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {currentPage * rowsPerPage + 1} to {Math.min((currentPage + 1) * rowsPerPage, data.length)} of {data.length} rows
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="border-slate-600 text-slate-300"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="border-slate-600 text-slate-300"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataGrid;
