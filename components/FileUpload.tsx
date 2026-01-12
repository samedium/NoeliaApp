import React, { useCallback } from 'react';
import { Upload, FileText, Database } from 'lucide-react';
import { parseFile } from '../services/fileService';
import { RawSurveyRow } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: string[], fileName: string) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, isLoading }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    try {
      const rawData: RawSurveyRow[] = await parseFile(file);
      const comments = rawData.map(r => r.comment);
      onDataLoaded(comments, file.name);
    } catch (error) {
      console.error("File parsing error", error);
      alert("Error parsing file. Please ensure it is a valid CSV or Excel file.");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`group relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 
          ${isLoading 
            ? 'border-noelia-300 bg-noelia-50/50 cursor-wait' 
            : 'border-slate-200 hover:border-noelia-500 hover:bg-noelia-50/30 hover:shadow-xl cursor-pointer bg-white'
          }`}
      >
        <input
          type="file"
          id="fileInput"
          accept=".csv, .xlsx, .xls"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-noelia-100 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-purple/10 rounded-full blur-3xl"></div>
        </div>

        <label htmlFor="fileInput" className="relative cursor-pointer flex flex-col items-center z-10">
            <div className={`p-5 rounded-2xl mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${isLoading ? 'bg-noelia-100' : 'bg-gradient-to-br from-noelia-50 to-white shadow-soft border border-slate-100'}`}>
                {isLoading ? (
                    <Database className="w-10 h-10 text-noelia-600 animate-pulse" />
                ) : (
                    <Upload className="w-10 h-10 text-noelia-600" />
                )}
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2 font-sans tracking-tight">
                Import Data Source
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                Drag and drop your survey export (CSV, XLSX). <br/>
                <span className="text-sm text-slate-400">Noelia will auto-detect sentiment & themes.</span>
            </p>
            
            <div className="flex gap-4">
                <span className="flex items-center px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <FileText className="w-3 h-3 mr-2 text-noelia-500" /> CSV
                </span>
                <span className="flex items-center px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <FileText className="w-3 h-3 mr-2 text-noelia-500" /> XLSX
                </span>
            </div>
        </label>
      </div>
      
      {isLoading && (
          <div className="mt-8 text-center space-y-4">
              <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-xs mx-auto overflow-hidden">
                <div className="bg-gradient-to-r from-noelia-400 to-noelia-600 h-1.5 rounded-full animate-progress-indeterminate"></div>
              </div>
              <p className="text-noelia-800 font-medium animate-pulse">Processing Intelligence...</p>
          </div>
      )}
      
      <style>{`
        @keyframes progress-indeterminate {
            0% { width: 0%; margin-left: 0%; }
            50% { width: 70%; margin-left: 30%; }
            100% { width: 0%; margin-left: 100%; }
        }
        .animate-progress-indeterminate {
            animation: progress-indeterminate 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FileUpload;