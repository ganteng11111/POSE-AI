
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import type { UploadedFile } from '../types';

interface ImageUploaderProps {
  onImageUpload: (file: UploadedFile) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        
        const uploadedFile: UploadedFile = {
            name: file.name,
            type: file.type,
            base64: base64,
            previewUrl: dataUrl
        };

        setPreview(uploadedFile.previewUrl);
        setFileName(uploadedFile.name);
        onImageUpload(uploadedFile);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-purple-500');
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-purple-500');
  };
  
  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-purple-500');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        1. Upload a Clear Portrait Photo
      </label>
      <div
        className="relative flex justify-center items-center w-full h-48 bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 transition-colors duration-300"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="text-center text-gray-400">
            <UploadIcon />
            <p className="mt-2">Click to upload or drag & drop</p>
            <p className="text-xs">PNG, JPG, or WEBP</p>
          </div>
        )}
      </div>
      {fileName && <p className="text-xs text-gray-400 mt-2 truncate">File: {fileName}</p>}
    </div>
  );
};
