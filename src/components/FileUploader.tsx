import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from '../hooks/useTranslation';
import { translationService } from '../services/translationService';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUploader({ onFileSelect, disabled = false }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const { t } = useTranslation();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [disabled]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      await validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = async (file: File) => {
    setValidationError(null);
    setValidationWarnings([]);
    
    console.log(`🔍 Validating file: ${file.name}, Size: ${file.size} bytes`);
    
    try {
      const validation = await translationService.validateFile(file);
      
      if (!validation.valid) {
        setValidationError(validation.error || 'File validation failed');
        setSelectedFile(null);
        return;
      }
      
      if (validation.warnings && validation.warnings.length > 0) {
        setValidationWarnings(validation.warnings);
      }
      
      setSelectedFile(file);
      console.log(`✅ File validated successfully: ${file.name}`);
    } catch (error) {
      setValidationError(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSelectedFile(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile && !disabled) {
      onFileSelect(selectedFile);
      setSelectedFile(null);
      setValidationError(null);
      setValidationWarnings([]);
    }
  };

  const clearFile = () => {
    if (!disabled) {
      setSelectedFile(null);
      setValidationError(null);
      setValidationWarnings([]);
    }
  };

  const getFileSizeInfo = (size: number): { text: string; color: string; icon: React.ReactNode } => {
    if (size < 1024) {
      return {
        text: `${size} bytes - TOO SMALL!`,
        color: 'text-red-400',
        icon: <AlertCircle className="w-4 h-4 text-red-400" />
      };
    } else if (size < 10240) {
      return {
        text: `${(size / 1024).toFixed(1)} KB - Very small`,
        color: 'text-yellow-400', 
        icon: <AlertCircle className="w-4 h-4 text-yellow-400" />
      };
    } else {
      return {
        text: `${(size / 1024 / 1024).toFixed(2)} MB`,
        color: 'text-green-400',
        icon: <FileText className="w-4 h-4 text-green-400" />
      };
    }
  };

  return (
    <div className="space-y-3">
      {/* Validation Error */}
      {validationError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-medium text-sm">File Validation Failed</span>
          </div>
          <p className="text-red-300 text-xs">{validationError}</p>
          
          {validationError.includes('70 bytes') && (
            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
              <p className="text-blue-300 text-xs">
                💡 Your file is only 70 bytes. Create a new PPTX in PowerPoint with actual content (should be at least 10KB).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-1">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-medium text-sm">Warnings</span>
          </div>
          {validationWarnings.map((warning, index) => (
            <p key={index} className="text-yellow-300 text-xs">{warning}</p>
          ))}
        </div>
      )}

      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
            disabled 
              ? 'border-gray-700 bg-gray-800/20 cursor-not-allowed opacity-50'
              : dragActive 
                ? 'border-blue-400 bg-blue-500/10' 
                : validationError
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className={`absolute inset-0 w-full h-full opacity-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            accept=".pptx,.ppt"
            onChange={handleFileSelect}
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center space-y-3">
            <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ${disabled ? 'opacity-50' : ''}`}>
              <Upload className="w-6 h-6" />
            </div>
            
            <div>
              <p className={`text-base font-medium mb-1 ${disabled ? 'text-gray-500' : validationError ? 'text-red-400' : 'text-white'}`}>
                {disabled ? 'Processing in progress...' : validationError ? 'File validation failed' : t('dragPPTXHere')}
              </p>
              <p className="text-gray-400 text-sm">
                {disabled ? 'Please wait for current translation to complete' : t('clickToSelect')}
              </p>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>{t('supportedFormats')}</p>
              <p className="text-blue-400">Size: 1KB - 100MB</p>
            </div>
          </div>

          {disabled && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">Translation in progress</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className={`absolute -inset-0.5 ${validationWarnings.length > 0 ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30' : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30'} rounded-xl blur opacity-75`}></div>
          <div className="relative border border-gray-600 rounded-xl p-4 bg-black/40 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const sizeInfo = getFileSizeInfo(selectedFile.size);
                      return (
                        <>
                          {sizeInfo.icon}
                          <p className={`text-xs ${sizeInfo.color}`}>
                            {sizeInfo.text}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                disabled={disabled}
                className="text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* File Details */}
            <div className="mb-3 p-2 bg-white/5 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white ml-1">{selectedFile.type || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white ml-1">{selectedFile.size.toLocaleString()} bytes</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleUpload}
              disabled={disabled}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {disabled ? 'Processing...' : t('startTranslation')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}