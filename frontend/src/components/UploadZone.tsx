import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';
import { UploadCloud } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UploadZone() {
  const { addDocument, updateDocument, replaceDocumentId } = useAppStore();
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList);
    
    for (const file of files) {
      // 1. Create a local temporary document tracking record
      const tempId = 'doc-' + Math.random().toString(36).substr(2, 9);
      
      const newDoc = {
        id: tempId,
        name: file.name,
        size: file.size,
        status: 'uploading' as const,
        progress: 0,
        uploadedAt: new Date().toISOString()
      };
      
      addDocument(newDoc);

      // 2. Perform upload
      try {
        const uploadedDoc = await apiService.uploadDocument(file, (progress, status, error) => {
          updateDocument(tempId, { progress, status, error });
        });
        
        if (uploadedDoc && uploadedDoc.id) {
          replaceDocumentId(tempId, uploadedDoc);
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#6366f1', '#8b5cf6', '#a78bfa']
          });
        }
      } catch (err) {
        updateDocument(tempId, {
          status: 'failed',
          error: err instanceof Error ? err.message : 'Upload failed due to a server error.'
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerBrowse}
        className={`w-full py-10 px-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/70 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-indigo-500/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.txt,.md"
          onChange={handleFileInput}
          className="hidden"
          data-testid="file-input"
        />

        <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full mb-4 text-indigo-600 dark:text-indigo-400">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1 text-center">
          Drag & drop your enterprise documents here
        </h3>
        <p className="text-xs text-slate-450 dark:text-slate-505 text-center leading-normal mb-3">
          Or click to browse from your device
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
          Supports PDF, Word, PowerPoint, Excel, CSV, Text & Markdown
        </span>
      </div>
    </div>
  );
}
