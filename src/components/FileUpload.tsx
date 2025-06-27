
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileProcessed: (fileName: string, data: any) => void;
}

interface ProcessingFile {
  name: string;
  progress: number;
  status: 'processing' | 'success' | 'error';
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([]);

  const validateData = (data: any[], fileName: string) => {
    const errors: any[] = [];
    const fileType = fileName.toLowerCase();

    // Basic validation logic
    data.forEach((row, index) => {
      if (fileType.includes('client')) {
        if (!row.ClientID) errors.push({ row: index, column: 'ClientID', message: 'ClientID is required', severity: 'error' });
        if (!row.Name) errors.push({ row: index, column: 'Name', message: 'Name is required', severity: 'error' });
      } else if (fileType.includes('worker')) {
        if (!row.WorkerID) errors.push({ row: index, column: 'WorkerID', message: 'WorkerID is required', severity: 'error' });
        if (!row.Skills) errors.push({ row: index, column: 'Skills', message: 'Skills are required', severity: 'warning' });
      } else if (fileType.includes('task')) {
        if (!row.TaskID) errors.push({ row: index, column: 'TaskID', message: 'TaskID is required', severity: 'error' });
        if (row.EstimatedHours && isNaN(Number(row.EstimatedHours))) {
          errors.push({ row: index, column: 'EstimatedHours', message: 'Must be a number', severity: 'error' });
        }
      }
    });

    return errors;
  };

  const processFile = async (file: File) => {
    const processingFile: ProcessingFile = {
      name: file.name,
      progress: 0,
      status: 'processing'
    };

    setProcessingFiles(prev => [...prev, processingFile]);

    try {
      // Simulate processing progress
      const updateProgress = (progress: number) => {
        setProcessingFiles(prev => 
          prev.map(f => f.name === file.name ? { ...f, progress } : f)
        );
      };

      updateProgress(25);

      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      let parsedData: any[] = [];
      let headers: string[] = [];

      if (isExcel) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        headers = jsonData[0] as string[];
        parsedData = jsonData.slice(1).map((row: any) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
      } else {
        // CSV parsing
        const text = await file.text();
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim()
        });
        
        parsedData = result.data;
        headers = Object.keys(parsedData[0] || {});
      }

      updateProgress(75);

      // Validate data
      const validationErrors = validateData(parsedData, file.name);
      
      updateProgress(100);

      const fileData = {
        name: file.name,
        data: parsedData,
        headers,
        validationErrors
      };

      onFileProcessed(file.name, fileData);
      
      setProcessingFiles(prev => 
        prev.map(f => f.name === file.name ? { ...f, status: 'success' } : f)
      );

      toast.success(`Successfully processed ${file.name}`);

    } catch (error) {
      console.error('Error processing file:', error);
      setProcessingFiles(prev => 
        prev.map(f => f.name === file.name ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : f)
      );
      toast.error(`Failed to process ${file.name}`);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(processFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: true
  });

  const clearProcessingFiles = () => {
    setProcessingFiles([]);
  };

  return (
    <div className="space-y-6">
      <Card 
        {...getRootProps()} 
        className={`p-8 border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragActive 
            ? 'border-purple-400 bg-purple-500/10' 
            : 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <div className="mb-4">
            {isDragActive ? (
              <Upload className="h-12 w-12 text-purple-400 mx-auto animate-bounce" />
            ) : (
              <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {isDragActive ? 'Drop files here' : 'Upload Data Files'}
          </h3>
          <p className="text-slate-400 mb-4">
            Drag & drop CSV or Excel files, or click to browse
          </p>
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
            Choose Files
          </Button>
        </div>
      </Card>

      {/* Processing Files */}
      {processingFiles.length > 0 && (
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Processing Files</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearProcessingFiles}
              className="text-slate-400 hover:text-white"
            >
              Clear
            </Button>
          </div>
          <div className="space-y-4">
            {processingFiles.map((file, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{file.name}</span>
                  <div className="flex items-center space-x-2">
                    {file.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-xs text-slate-400">
                      {file.status === 'processing' && `${file.progress}%`}
                      {file.status === 'success' && 'Complete'}
                      {file.status === 'error' && 'Failed'}
                    </span>
                  </div>
                </div>
                {file.status === 'processing' && (
                  <Progress value={file.progress} className="h-2" />
                )}
                {file.status === 'error' && file.error && (
                  <p className="text-xs text-red-400">{file.error}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
