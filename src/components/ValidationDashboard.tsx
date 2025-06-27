
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, AlertTriangle, CheckCircle, Download, Filter, TrendingUp } from 'lucide-react';
import { validationEngine } from '@/utils/validationEngine';

interface ValidationDashboardProps {
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
        ruleId?: string;
      }>;
    };
  };
}

const generateRecommendations = (errorCount: number, warningCount: number, validationScore: number) => {
  const recommendations = [];
  
  if (errorCount > 0) {
    recommendations.push("Fix all errors before proceeding with data processing");
  }
  
  if (warningCount > 10) {
    recommendations.push("Review warnings to improve data quality");
  }
  
  if (validationScore < 80) {
    recommendations.push("Consider data cleanup before using this dataset");
  }
  
  return recommendations;
};

const ValidationDashboard: React.FC<ValidationDashboardProps> = ({ files }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'errors' | 'warnings'>('all');
  
  const allErrors = Object.values(files).flatMap(file => 
    file.validationErrors.map(error => ({ ...error, fileName: file.name }))
  );

  const errorCount = allErrors.filter(e => e.severity === 'error').length;
  const warningCount = allErrors.filter(e => e.severity === 'warning').length;
  const totalRows = Object.values(files).reduce((sum, file) => sum + file.data.length, 0);
  const validationScore = totalRows > 0 ? Math.max(0, 100 - ((errorCount * 10 + warningCount * 2) / totalRows * 100)) : 100;

  // Group errors by rule type
  const errorsByRule = allErrors.reduce((acc, error) => {
    const ruleId = error.ruleId || 'unknown';
    if (!acc[ruleId]) {
      acc[ruleId] = { count: 0, errors: [], rule: null };
    }
    acc[ruleId].count++;
    acc[ruleId].errors.push(error);
    acc[ruleId].rule = validationEngine.getRules().find(r => r.id === ruleId);
    return acc;
  }, {} as any);

  const filteredErrors = selectedFilter === 'all' ? allErrors : 
    allErrors.filter(e => e.severity === (selectedFilter === 'errors' ? 'error' : 'warning'));

  const exportDetailedReport = () => {
    const report = {
      summary: {
        totalFiles: Object.keys(files).length,
        totalRows,
        totalErrors: errorCount,
        totalWarnings: warningCount,
        validationScore: Math.round(validationScore),
        timestamp: new Date().toISOString()
      },
      ruleBreakdown: Object.entries(errorsByRule).map(([ruleId, data]: [string, any]) => ({
        ruleId,
        ruleName: data.rule?.name || 'Unknown Rule',
        ruleType: data.rule?.type || 'unknown',
        count: data.count,
        severity: data.rule?.severity || 'error'
      })),
      detailedErrors: allErrors,
      recommendations: generateRecommendations(errorCount, warningCount, validationScore)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Validation Score</p>
              <p className="text-2xl font-bold text-white">{Math.round(validationScore)}%</p>
            </div>
            <div className="relative">
              <TrendingUp className={`h-6 w-6 ${validationScore >= 80 ? 'text-green-400' : validationScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`} />
            </div>
          </div>
          <Progress value={validationScore} className="mt-2" />
        </Card>

        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Rows</p>
              <p className="text-2xl font-bold text-white">{totalRows.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-300 uppercase tracking-wide">Critical Errors</p>
              <p className="text-2xl font-bold text-red-400">{errorCount}</p>
            </div>
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
        </Card>

        <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-300 uppercase tracking-wide">Warnings</p>
              <p className="text-2xl font-bold text-yellow-400">{warningCount}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Validation Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules Breakdown</TabsTrigger>
          <TabsTrigger value="details">Detailed Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Summary */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Files Overview</h3>
              <div className="space-y-3">
                {Object.entries(files).map(([fileName, fileData]) => {
                  const fileErrors = fileData.validationErrors.filter(e => e.severity === 'error').length;
                  const fileWarnings = fileData.validationErrors.filter(e => e.severity === 'warning').length;
                  
                  return (
                    <div key={fileName} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{fileName}</p>
                        <p className="text-sm text-slate-400">{fileData.data.length} rows</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {fileErrors > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {fileErrors} errors
                          </Badge>
                        )}
                        {fileWarnings > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {fileWarnings} warnings
                          </Badge>
                        )}
                        {fileErrors === 0 && fileWarnings === 0 && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            Clean
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
              <div className="space-y-2">
                {generateRecommendations(errorCount, warningCount, validationScore).map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-300">{rec}</p>
                  </div>
                ))}
                {generateRecommendations(errorCount, warningCount, validationScore).length === 0 && (
                  <p className="text-slate-400 text-sm">No specific recommendations. Data quality looks good!</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(errorsByRule).map(([ruleId, data]: [string, any]) => (
              <Card key={ruleId} className="p-4 bg-slate-800/50 border-slate-700">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">
                    {data.rule?.name || 'Unknown Rule'}
                  </h4>
                  <Badge variant={data.rule?.severity === 'error' ? 'destructive' : 'secondary'}>
                    {data.count}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  Type: {data.rule?.type || 'unknown'}
                </p>
                <p className="text-xs text-slate-300">
                  {data.rule?.message || 'No description available'}
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Detailed Error List</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFilter(selectedFilter === 'all' ? 'errors' : 'all')}
                  className="border-slate-600"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedFilter === 'all' ? 'Show Errors Only' : 'Show All'}
                </Button>
                <Button onClick={exportDetailedReport} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredErrors.slice(0, 50).map((error, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    error.severity === 'error' 
                      ? 'bg-red-500/10 border-red-500' 
                      : 'bg-yellow-500/10 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-1">
                        {error.fileName} - Row {error.row + 1}, Column "{error.column}"
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
              
              {filteredErrors.length > 50 && (
                <p className="text-sm text-slate-400 text-center py-2">
                  Showing 50 of {filteredErrors.length} issues. Export report for complete list.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {allErrors.length === 0 && (
        <Card className="p-12 bg-green-500/10 border-green-500/30 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-400 mb-2">Perfect Data Quality!</h3>
          <p className="text-green-300">All validation rules passed. Your data is ready for processing.</p>
        </Card>
      )}
    </div>
  );
};

export default ValidationDashboard;
