
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle, Download } from 'lucide-react';

interface ValidationSummaryProps {
  files: {
    [key: string]: {
      name: string;
      data: any[];
      headers: string[];
      validationErrors: Array<{
        row: number;
        column: string;
        message: string;
        severity: 'error' | 'warning';
      }>;
    };
  };
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({ files }) => {
  const allErrors = Object.values(files).flatMap(file => 
    file.validationErrors.map(error => ({ ...error, fileName: file.name }))
  );

  const errorCount = allErrors.filter(e => e.severity === 'error').length;
  const warningCount = allErrors.filter(e => e.severity === 'warning').length;

  const groupedErrors = allErrors.reduce((acc, error) => {
    const key = `${error.fileName}-${error.severity}`;
    if (!acc[key]) {
      acc[key] = {
        fileName: error.fileName,
        severity: error.severity,
        errors: []
      };
    }
    acc[key].errors.push(error);
    return acc;
  }, {} as any);

  const exportValidationReport = () => {
    const report = {
      summary: {
        totalFiles: Object.keys(files).length,
        totalErrors: errorCount,
        totalWarnings: warningCount,
        timestamp: new Date().toISOString()
      },
      details: allErrors
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Files</p>
              <p className="text-2xl font-bold text-white">{Object.keys(files).length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6 bg-red-500/10 border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-300">Errors</p>
              <p className="text-2xl font-bold text-red-400">{errorCount}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </Card>

        <Card className="p-6 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-300">Warnings</p>
              <p className="text-2xl font-bold text-yellow-400">{warningCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Export Button */}
      {allErrors.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={exportValidationReport} className="bg-purple-600 hover:bg-purple-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      )}

      {/* Detailed Errors */}
      {Object.values(groupedErrors).map((group: any, index) => (
        <Card key={index} className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-white">{group.fileName}</h3>
              <Badge variant={group.severity === 'error' ? 'destructive' : 'secondary'}>
                {group.errors.length} {group.severity}s
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            {group.errors.slice(0, 10).map((error: any, errorIndex: number) => (
              <div 
                key={errorIndex}
                className={`p-3 rounded-lg border-l-4 ${
                  error.severity === 'error' 
                    ? 'bg-red-500/10 border-red-500' 
                    : 'bg-yellow-500/10 border-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">
                      Row {error.row + 1}, Column "{error.column}"
                    </p>
                    <p className="text-sm text-slate-300">{error.message}</p>
                  </div>
                  {error.severity === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                  )}
                </div>
              </div>
            ))}
            
            {group.errors.length > 10 && (
              <p className="text-sm text-slate-400 text-center py-2">
                ... and {group.errors.length - 10} more {group.severity}s
              </p>
            )}
          </div>
        </Card>
      ))}

      {allErrors.length === 0 && (
        <Card className="p-12 bg-green-500/10 border-green-500/30 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-400 mb-2">All Good!</h3>
          <p className="text-green-300">No validation errors or warnings found in your data</p>
        </Card>
      )}
    </div>
  );
};

export default ValidationSummary;
