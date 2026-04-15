'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useImageUpload } from '@/lib/useImageUpload';

interface ImageUploadProps {
  onUploadSuccess?: (url: string, publicId: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  accept?: string;
  maxSize?: string;
  placeholder?: string;
  currentImage?: string;
  width?: number;
  height?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  className = '',
  accept = 'image/*',
  maxSize = '10MB',
  placeholder = 'Click to upload image',
  currentImage,
  width = 120,
  height = 120,
}) => {
  const { uploadImage, uploading, progress } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  React.useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadImage(file);

    if (result.success && result.url) {
      setPreview(result.url);
      onUploadSuccess?.(result.url, result.public_id || '');
    } else {
      onUploadError?.(result.error || 'Upload failed');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`image-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div
        onClick={handleClick}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: uploading ? '#f3f4f6' : '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📷</div>
            <div style={{ fontSize: '12px' }}>{placeholder}</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>Max: {maxSize}</div>
          </div>
        )}

        {uploading && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: '#e5e7eb',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: '#3b82f6',
                width: `${progress}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};