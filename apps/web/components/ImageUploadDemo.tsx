'use client';

import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';

export const ImageUploadDemo: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string, publicId: string}>>([]);

  const handleUploadSuccess = (url: string, publicId: string) => {
    setUploadedImages(prev => [...prev, { url, publicId }]);
    console.log('Image uploaded successfully:', { url, publicId });
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    alert(`Upload failed: ${error}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Image Upload Demo</h3>

      <div style={{ marginBottom: '20px' }}>
        <ImageUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          placeholder="Upload an image"
        />
      </div>

      {uploadedImages.length > 0 && (
        <div>
          <h4>Uploaded Images:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {uploadedImages.map((image, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={image.url}
                  alt={`Uploaded ${index + 1}`}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db'
                  }}
                />
                <button
                  onClick={() => {
                    setUploadedImages(prev => prev.filter((_, i) => i !== index));
                  }}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};