
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from '@/components/FileUpload';
import DataGrid from '@/components/DataGrid';
import ValidationDashboard from '@/components/ValidationDashboard';
import AIQueryInterface from '@/components/AIQueryInterface';
import RuleBuilder from '@/components/RuleBuilder';
import PrioritizationEngine from '@/components/PrioritizationEngine';
import { Brain, Database, FileCheck, Settings, Sparkles, Target } from 'lucide-react';
import { validationEngine } from '@/utils/validationEngine';

interface FileData {
  name: string;
  data: any[];
  headers: string[];
  validationErrors: ValidationError[];
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
  ruleId?: string;
}

const Index = () => {
  const [files, setFiles] = useState<{ [key: string]: FileData }>({});
  const [activeTab, setActiveTab] = useState('upload');
  const [rules, setRules] = useState<any[]>([]);

  const handleFileProcessed = (fileName: string, data: FileData) => {
    // Run comprehensive validation
    const validationErrors = validationEngine.validateData(
      data.data, 
      data.headers, 
      fileName, 
      files
    );

    const processedData = {
      ...data,
      validationErrors
    };

    setFiles(prev => ({ ...prev, [fileName]: processedData }));
  };

  // Re-run validation when files change (for cross-file references)
  useEffect(() => {
    const revalidateFiles = () => {
      const updatedFiles = { ...files };
      let hasChanges = false;

      Object.entries(files).forEach(([fileName, fileData]) => {
        const newErrors = validationEngine.validateData(
          fileData.data,
          fileData.headers,
          fileName,
          files
        );

        if (JSON.stringify(newErrors) !== JSON.stringify(fileData.validationErrors)) {
          updatedFiles[fileName] = { ...fileData, validationErrors: newErrors };
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setFiles(updatedFiles);
      }
    };

    if (Object.keys(files).length > 1) {
      revalidateFiles();
    }
  }, [Object.keys(files).length]);

  const totalErrors = Object.values(files).reduce((sum, file) => 
    sum + file.validationErrors.filter(e => e.severity === 'error').length, 0
  );

  const totalWarnings = Object.values(files).reduce((sum, file) => 
    sum + file.validationErrors.filter(e => e.severity === 'warning').length, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="h-8 w-8 text-purple-400" />
                <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Data Alchemist</h1>
                <p className="text-sm text-slate-400">AI-Powered Spreadsheet Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {totalErrors > 0 && (
                <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-red-300 text-sm">{totalErrors} errors</span>
                </div>
              )}
              {totalWarnings > 0 && (
                <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-yellow-300 text-sm">{totalWarnings} warnings</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <FileCheck className="h-4 w-4" />
              <span>Data ({Object.keys(files).length})</span>
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Validation</span>
            </TabsTrigger>
            <TabsTrigger value="priority" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Priority</span>
            </TabsTrigger>
            <TabsTrigger value="query" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI Query</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Rules</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Upload Your Data Files</h2>
              <p className="text-slate-400 mb-6">
                Support for clients.csv, workers.csv, tasks.csv and Excel files
              </p>
              <FileUpload onFileProcessed={handleFileProcessed} />
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            {Object.entries(files).map(([fileName, fileData]) => (
              <Card key={fileName} className="p-6 bg-slate-800/50 border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{fileName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">
                      {fileData.data.length} rows, {fileData.headers.length} columns
                    </span>
                  </div>
                </div>
                <DataGrid data={fileData.data} headers={fileData.headers} validationErrors={fileData.validationErrors} />
              </Card>
            ))}
            {Object.keys(files).length === 0 && (
              <Card className="p-12 bg-slate-800/50 border-slate-700 text-center">
                <Database className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Data Files</h3>
                <p className="text-slate-400">Upload files in the Upload tab to view and edit your data</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <ValidationDashboard files={files} />
          </TabsContent>

          <TabsContent value="priority" className="space-y-6">
            <PrioritizationEngine />
          </TabsContent>

          <TabsContent value="query" className="space-y-6">
            <AIQueryInterface files={files} />
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <RuleBuilder rules={rules} onRulesChange={setRules} files={files} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
