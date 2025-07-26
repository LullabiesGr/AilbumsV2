import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import { useToast } from '../context/ToastContext';

interface UploadButtonProps {
  variant?: 'primary' | 'secondary';
}

const UploadButton: React.FC<UploadButtonProps> = ({ variant = 'primary' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhotos, isUploading } = usePhoto();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadPhotos(Array.from(files));
      // Reset the input value so the same file can be uploaded again if needed
      event.target.value = '';
    }
  };

  const getButtonText = () => {
    if (isUploading) return 'Uploading...';
    return variant === 'primary' ? 'Upload Photos' : 'Add More Photos';
  };
  const buttonClasses = variant === 'primary'
    ? "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center space-x-2 transition-colors duration-200"
    : "px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-md flex items-center space-x-2 transition-colors duration-200";

  return (
    <>
      <button 
        className={buttonClasses}
        onClick={handleUploadClick}
        disabled={isUploading}
      >
        <Upload className="h-5 w-5" />
        <span>{getButtonText()}</span>
      </button>
      <input 
        type="file" 
        ref={fileInputRef}
        accept=".jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

export default UploadButton;