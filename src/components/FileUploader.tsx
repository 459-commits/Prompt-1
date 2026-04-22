import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploaderProps {
  onFilesSelect: (files: File[]) => void;
  isLoading: boolean;
}

export default function FileUploader({ onFilesSelect, isLoading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(file => 
      file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
      onFilesSelect([...selectedFiles, ...newFiles]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [selectedFiles, onFilesSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelect(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50/50' 
            : 'border-slate-300 hover:border-indigo-400 bg-slate-50'
        }`}
      >
        <input
          type="file"
          onChange={handleFileInput}
          multiple
          accept=".pdf,image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload size={24} />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-slate-900 leading-tight mb-1">
            Drop bank statements here
          </p>
          <p className="text-xs text-slate-500">
            Select multiple PDF or Image files
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {selectedFiles.map((file, idx) => (
              <motion.div
                key={`${file.name}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm"
              >
                <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isLoading && (
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </motion.div>
            ))}
            
            {!isLoading && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-[0.2em] transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
