import React, { useState, useRef } from 'react';
import { Upload, Download, Palette, RotateCcw, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCredits } from '../context/CreditsContext';
import { useToast } from '../context/ToastContext';
import { lutAndApplyWithCredits } from '../lib/creditsApi';
import FeatureCostIndicator from './FeatureCostIndicator';

const LUTApplyPage: React.FC = () => {
  const { user } = useAuth();
  const { balance, updateCreditsFromResponse } = useCredits();
  const { showToast } = useToast();
  
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [strength, setStrength] = useState<number>(0.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showComparison, setShowComparison] = useState(false);
  
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);

  const handleReferenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReferenceFile(file);
    }
  };

  const handleSourceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSourceFile(file);
    }
  };

  const handleApplyLUT = async () => {
    if (!referenceFile || !sourceFile) {
      showToast('Please upload both reference and source images', 'warning');
      return;
    }

    if (!user?.id) {
      showToast('User not authenticated', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await lutAndApplyWithCredits(
        referenceFile,
        sourceFile,
        strength,
        user.id
      );

      // Update credits from response
      if (response.credits) {
        updateCreditsFromResponse(response.credits);
      }

      setResult(response);
      setShowComparison(true);
      showToast('LUT applied successfully!', 'success');
    } catch (error: any) {
      console.error('LUT apply failed:', error);
      showToast(error.message || 'LUT application failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadResult = () => {
    if (!result?.result_image_base64) return;

    try {
      const byteCharacters = atob(result.result_image_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lut_applied_${sourceFile?.name || 'image.jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Image downloaded!', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Failed to download image', 'error');
    }
  };

  const handleDownloadLUT = () => {
    if (!result?.lut_cube_file) return;

    const a = document.createElement('a');
    a.href = `${import.meta.env.VITE_API_BASE_URL}/${result.lut_cube_file}`;
    a.download = result.lut_cube_file.split('/').pop() || 'lut.cube';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showToast('LUT file downloaded!', 'success');
  };

  const handleReset = () => {
    setReferenceFile(null);
    setSourceFile(null);
    setResult(null);
    setShowComparison(false);
    setStrength(0.5);
    
    if (referenceInputRef.current) referenceInputRef.current.value = '';
    if (sourceInputRef.current) sourceInputRef.current.value = '';
  };

  const canAfford = balance >= 2; // LUT & Apply costs 2 credits

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          LUT & Apply
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Transfer color grading from a reference image to your target image
        </p>
        <FeatureCostIndicator feature="lut_apply" showBalance={true} />
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reference Image */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Reference Image
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload the image whose color grading you want to copy
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => referenceInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 
                       rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors 
                       duration-200 flex flex-col items-center space-y-2"
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {referenceFile ? referenceFile.name : 'Click to upload reference'}
              </span>
            </button>
            
            <input
              ref={referenceInputRef}
              type="file"
              accept="image/*"
              onChange={handleReferenceUpload}
              className="hidden"
            />
            
            {referenceFile && (
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(referenceFile)}
                  alt="Reference"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Source Image */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Source Image
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload the image you want to apply the color grading to
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => sourceInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 
                       rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors 
                       duration-200 flex flex-col items-center space-y-2"
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {sourceFile ? sourceFile.name : 'Click to upload source'}
              </span>
            </button>
            
            <input
              ref={sourceInputRef}
              type="file"
              accept="image/*"
              onChange={handleSourceUpload}
              className="hidden"
            />
            
            {sourceFile && (
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(sourceFile)}
                  alt="Source"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Strength
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                {strength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={strength}
              onChange={(e) => setStrength(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Subtle (0.0)</span>
              <span>Strong (1.0)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleApplyLUT}
          disabled={!referenceFile || !sourceFile || isProcessing || !canAfford}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 
                   hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 
                   disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                   flex items-center space-x-2 transition-all duration-200 font-medium text-lg"
        >
          <Palette className="h-5 w-5" />
          <span>{isProcessing ? 'Processing...' : 'Apply LUT'}</span>
        </button>

        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg 
                   flex items-center space-x-2 transition-colors duration-200"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Insufficient Credits Warning */}
      {!canAfford && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200">
                Insufficient Credits
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                You need 2 credits to use LUT & Apply. Current balance: {balance}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Results
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                         flex items-center space-x-1 transition-colors duration-200"
              >
                {showComparison ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showComparison ? 'Hide' : 'Show'} Comparison</span>
              </button>
            </div>
          </div>

          {/* Result Image */}
          <div className="space-y-4">
            {result.result_image_base64 && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={`data:image/jpeg;base64,${result.result_image_base64}`}
                  alt="LUT Applied Result"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Result Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Strength Used:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {result.strength_used?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Credits Debited:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{result.credits?.debited || 0}
                  </span>
                </div>
              </div>
              
              {result.info && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {result.info}
                  </p>
                </div>
              )}
            </div>

            {/* Download Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadResult}
                disabled={!result.result_image_base64}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                         text-white rounded-lg flex items-center justify-center space-x-2 
                         transition-colors duration-200 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>Download Result</span>
              </button>
              
              <button
                onClick={handleDownloadLUT}
                disabled={!result.lut_cube_file}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                         text-white rounded-lg flex items-center justify-center space-x-2 
                         transition-colors duration-200 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>Download LUT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LUTApplyPage;