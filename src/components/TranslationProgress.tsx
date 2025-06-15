import React from 'react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FileText, Clock, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { TranslationResult } from '../services/translationService';

type TranslationJob = {
  id: string;
  fileName: string;
  sourceFile: File;
  selectedLanguages: string[];
  status: 'pending' | 'extracting' | 'translating' | 'rebuilding' | 'completed' | 'error';
  progress: number;
  currentStep?: string;
  results?: TranslationResult[];
  error?: string;
};

interface TranslationProgressProps {
  job: TranslationJob;
  onDownload?: (job: TranslationJob, language: string) => void;
  onDownloadAll?: (job: TranslationJob) => void;
}

export default function TranslationProgress({ job, onDownload, onDownloadAll }: TranslationProgressProps) {
  const { t } = useTranslation();

  const statusConfig = {
    pending: {
      icon: Clock,
      label: t('pending'),
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30'
    },
    extracting: {
      icon: FileText,
      label: t('extractingText'),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    translating: {
      icon: Loader2,
      label: t('translationInProgress'),
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    },
    rebuilding: {
      icon: FileText,
      label: t('rebuildingPPTX'),
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/30'
    },
    completed: {
      icon: CheckCircle,
      label: t('completed'),
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    error: {
      icon: AlertCircle,
      label: t('error'),
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    }
  };

  const config = statusConfig[job.status];
  const Icon = config.icon;
  const isLoading = ['extracting', 'translating', 'rebuilding'].includes(job.status);

  const handleDownload = (language: string) => {
    if (onDownload) {
      onDownload(job, language);
    }
  };

  const handleDownloadAll = () => {
    if (onDownloadAll) {
      onDownloadAll(job);
    }
  };

  return (
    <div className="relative">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${
        job.status === 'completed' ? 'from-green-500/20 to-emerald-500/20' :
        job.status === 'error' ? 'from-red-500/20 to-pink-500/20' :
        'from-blue-500/20 to-purple-500/20'
      } rounded-xl blur opacity-50 ${isLoading ? 'animate-pulse' : ''}`}></div>
      
      <div className={`relative border rounded-xl p-6 bg-black/40 backdrop-blur-sm transition-all duration-300 ${config.borderColor} shadow-xl`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor} shadow-lg`}>
              <Icon className={`w-5 h-5 ${config.color} ${isLoading && job.status === 'translating' ? 'animate-spin' : ''}`} />
            </div>
            
            <div>
              <h3 className="text-white font-medium">{job.fileName}</h3>
              <p className="text-gray-400 text-sm">
                {(job.sourceFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={`${config.bgColor} ${config.color} border-transparent shadow-sm`}>
              {config.label}
            </Badge>
            
            {job.status === 'completed' && onDownloadAll && (
              <Button
                size="sm"
                onClick={handleDownloadAll}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Download className="w-4 h-4 mr-1" />
                All
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">{t('progress')}</span>
            <span className="text-sm text-white">{job.progress}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={job.progress} 
              className="h-2 bg-gray-800/50 backdrop-blur-sm"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            )}
          </div>
        </div>

        {/* Current Step */}
        {job.currentStep && (
          <div className="mb-4">
            <p className="text-sm text-blue-400">{job.currentStep}</p>
          </div>
        )}

        {/* Selected Languages */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">{t('targetLanguagesLabel')}</p>
          <div className="flex flex-wrap gap-2">
            {job.selectedLanguages.map(lang => (
              <Badge 
                key={lang} 
                variant="outline" 
                className="text-xs border-gray-600 text-gray-300 bg-gray-800/30 backdrop-blur-sm"
              >
                {lang.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {job.error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
            <p className="text-red-400 text-sm">{job.error}</p>
          </div>
        )}

        {/* Completion Details with Downloads */}
        {job.status === 'completed' && job.results && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">
                {t('translationCompletedSuccessfully')}
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-3">
              {t('generatedFiles', { count: job.results.length.toString() })}
            </p>
            
            {/* Individual Download Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {job.results.map(result => (
                <Button
                  key={result.language}
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(result.language)}
                  className="text-xs border-green-500/30 text-green-400 hover:bg-green-500/20"
                >
                  <Download className="w-3 h-3 mr-1" />
                  {result.language.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Processing Steps */}
        {isLoading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}