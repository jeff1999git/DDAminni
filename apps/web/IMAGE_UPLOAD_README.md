# Image Upload with Cloudinary Setup

This project now includes image upload functionality using Cloudinary. Here's what has been set up:

## 🚀 What's Included

### 1. Dependencies
- `cloudinary` - Cloudinary SDK for image uploads
- `multer` - For handling multipart/form-data
- `@types/multer` - TypeScript types

### 2. Environment Variables
Add these to your `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. API Route
- `/api/upload` - Handles image uploads to Cloudinary

### 4. Utility Functions
- `lib/cloudinary.ts` - Cloudinary configuration and helper functions
- `lib/useImageUpload.ts` - React hook for easy image uploads

### 5. Components
- `components/ImageUpload.tsx` - Reusable image upload component
- `components/ImageUploadDemo.tsx` - Example usage

## 📖 Usage

### Basic Usage with Hook

```tsx
import { useImageUpload } from '@/lib/useImageUpload';

function MyComponent() {
  const { uploadImage, uploading, progress } = useImageUpload();

  const handleFileUpload = async (file: File) => {
    const result = await uploadImage(file);
    if (result.success) {
      console.log('Uploaded:', result.url);
    } else {
      console.error('Error:', result.error);
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      disabled={uploading}
    />
    {uploading && <progress value={progress} max={100} />}
  );
}
```

### Using the ImageUpload Component

```tsx
import { ImageUpload } from '@/components/ImageUpload';

function MyComponent() {
  const handleSuccess = (url: string, publicId: string) => {
    // Handle successful upload
    console.log('Image uploaded:', url);
  };

  const handleError = (error: string) => {
    // Handle upload error
    console.error('Upload failed:', error);
  };

  return (
    <ImageUpload
      onUploadSuccess={handleSuccess}
      onUploadError={handleError}
      placeholder="Choose an image"
      maxSize="5MB"
    />
  );
}
```

### Direct API Usage

```tsx
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  return result;
};
```

## 🔧 Configuration

### File Validation
- Maximum file size: 10MB (configurable)
- Accepted formats: Images only
- Automatic format detection

### Cloudinary Settings
- Default folder: `dd-ammini`
- Resource type: `auto` (supports images, videos, etc.)
- Secure URLs: All uploaded images use HTTPS

## 🛠️ Advanced Usage

### Custom Transformations
```tsx
import { uploadToCloudinary } from '@/lib/cloudinary';

const result = await uploadToCloudinary(file, {
  folder: 'custom-folder',
  transformation: [
    { width: 500, height: 500, crop: 'fill' },
    { quality: 'auto' }
  ]
});
```

### Delete Images
```tsx
import { deleteFromCloudinary } from '@/lib/cloudinary';

await deleteFromCloudinary('public_id_here');
```

## 📝 Notes

- Images are uploaded to the `dd-ammini` folder in your Cloudinary account
- All uploads include progress tracking
- Error handling is built-in
- TypeScript support included
- Responsive design ready

## 🐛 Troubleshooting

1. **Environment Variables**: Make sure all Cloudinary credentials are set in `.env`
2. **File Size**: Check that files are under 10MB
3. **File Type**: Only image files are accepted
4. **Network**: Ensure stable internet connection for uploads

## 📚 Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)