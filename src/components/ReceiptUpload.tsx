import React, { useState } from 'react';
import { Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react';

interface ReceiptUploadProps {
  onUpload?: (file: File) => void;
  maxSize?: number;
}

export const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ 
  onUpload, 
  maxSize = 5 * 1024 * 1024 // 5MB default
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file');
      setUploadStatus('error');
      return;
    }
    
    // Validate file size
    if (file.size > maxSize) {
      setErrorMessage(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      setUploadStatus('error');
      return;
    }
    
    setUploadStatus('uploading');
    setErrorMessage('');
    
    // Simulate upload process
    setTimeout(() => {
      setUploadStatus('success');
      onUpload?.(file);
    }, 1500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Upload className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Analyzing receipt...';
      case 'success':
        return 'Receipt uploaded successfully!';
      case 'error':
        return errorMessage;
      default:
        return 'Drop your receipt image here or click to browse';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'}
          ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
          ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
          hover:border-green-400 hover:bg-green-50 cursor-pointer
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          <p className="text-sm text-gray-600">{getStatusMessage()}</p>
          
          {uploadStatus === 'idle' && (
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Camera className="h-4 w-4" />
                <span>Photo</span>
              </div>
              <div className="flex items-center space-x-1">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Supported formats: JPG, PNG, HEIC</p>
        <p>Maximum file size: {maxSize / (1024 * 1024)}MB</p>
      </div>
    </div>
  );
};

export default ReceiptUpload;