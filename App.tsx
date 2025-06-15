import React, { useState } from 'react';
import { Upload, Download, Globe, FileText, CheckCircle, Clock, AlertCircle, Languages } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Checkbox } from './components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import FileUploader from './components/FileUploader';
import LanguageSelector from './components/LanguageSelector';
import TranslationProgress from './components/TranslationProgress';
import ResultsSection from './components/ResultsSection';
import { useTranslation } from './hooks/useTranslation';
import { translationService, TranslationResult } from './services/translationService';

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

const AVAILABLE_LANGUAGES = [
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

const UI_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export default function App() {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { t, currentLanguage, changeLanguage } = useTranslation();
  
  const addTranslationJob = async (file: File) => {
    if (selectedLanguages.length === 0) {
      alert(t('selectAtLeastOneLanguage'));
      return;
    }

    // Validate file
    const validation = translationService.validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (isProcessing) {
      alert('Please wait for the current translation to complete before starting a new one.');
      return;
    }
    
    const newJob: TranslationJob = {
      id: Date.now().toString(),
      fileName: file.name,
      sourceFile: file,
      selectedLanguages: [...selectedLanguages],
      status: 'pending',
      progress: 0,
    };
    
    setJobs(prev => [...prev, newJob]);
    setIsProcessing(true);
    
    try {
      await startRealTranslation(newJob.id, file, selectedLanguages);
    } catch (error) {
      console.error('Translation failed:', error);
      updateJob(newJob.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Translation failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateJob = (jobId: string, updates: Partial<TranslationJob>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  const startRealTranslation = async (jobId: string, file: File, targetLanguages: string[]) => {
    // Set up progress callback
    translationService.onProgress(jobId, (progress) => {
      updateJob(jobId, {
        status: progress.status,
        progress: progress.progress,
        currentStep: progress.currentStep,
        error: progress.error
      });
    });

    try {
      // Start the actual translation process
      const results = await translationService.startTranslation(
        jobId,
        file,
        targetLanguages
      );

      // Update job with results
      updateJob(jobId, {
        status: 'completed',
        progress: 100,
        results: results
      });

      console.log(`✅ Translation completed for job ${jobId}`, results);

    } catch (error) {
      console.error(`❌ Translation failed for job ${jobId}:`, error);
      
      updateJob(jobId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const handleDownload = async (job: TranslationJob, language: string) => {
    if (!job.results) return;
    
    const result = job.results.find(r => r.language === language);
    if (!result) return;

    try {
      await translationService.downloadFile(result.fileId, result.fileName);
    } catch (error) {
      alert(`Failed to download ${result.fileName}: ${error}`);
    }
  };

  const handleDownloadAll = async (job: TranslationJob) => {
    if (!job.results) return;

    try {
      await translationService.downloadAllFiles(job.results, job.fileName);
    } catch (error) {
      alert(`Failed to download files: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Moving Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-float-slow top-20 left-10"></div>
        <div className="absolute w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-float-reverse bottom-20 right-10"></div>
        <div className="absolute w-48 h-48 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-xl animate-float-fast top-1/2 right-1/4"></div>
      </div>

      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-end mb-4">
            <Select value={currentLanguage} onValueChange={changeLanguage}>
              <SelectTrigger className="w-40 bg-white/5 backdrop-blur-sm border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {UI_LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-gray-800">
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <h1 className="text-5xl font-serif bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              PPTX Translator Pro
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          
          {/* Google Service Integration Badge */}
          <div className="flex justify-center mt-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Connected to Google Services
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Upload & Language Selection */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="relative">
              {/* Liquid Glass Background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl blur opacity-75 animate-gradient-shift"></div>
              <Card className="relative p-8 bg-black/40 backdrop-blur-sm border-white/10 border shadow-2xl">
                <h2 className="text-2xl font-serif mb-6 text-white">{t('selectPPTXFile')}</h2>
                <FileUploader 
                  onFileSelect={addTranslationJob}
                  disabled={isProcessing}
                />
              </Card>
            </div>

            <div className="relative">
              {/* Liquid Glass Background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-xl blur opacity-75 animate-gradient-shift-reverse"></div>
              <Card className="relative p-8 bg-black/40 backdrop-blur-sm border-white/10 border shadow-2xl">
                <h2 className="text-2xl font-serif mb-6 text-white">{t('targetLanguages')}</h2>
                <LanguageSelector 
                  languages={AVAILABLE_LANGUAGES}
                  selectedLanguages={selectedLanguages}
                  onSelectionChange={setSelectedLanguages}
                  maxSelection={5}
                  disabled={isProcessing}
                />
              </Card>
            </div>
          </div>

          {/* Processing Warning */}
          {isProcessing && (
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl blur opacity-75 animate-pulse"></div>
              <Card className="relative p-4 bg-black/40 backdrop-blur-sm border-yellow-500/20 border">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-400">
                    Translation in progress. Please wait before starting another translation.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Translation Jobs */}
          {jobs.length > 0 && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-xl blur opacity-75 animate-gradient-shift-slow"></div>
              <Card className="relative p-8 bg-black/40 backdrop-blur-sm border-white/10 border shadow-2xl">
                <h2 className="text-2xl font-serif mb-6 text-white">{t('translationStatus')}</h2>
                <div className="space-y-6">
                  {jobs.map(job => (
                    <TranslationProgress 
                      key={job.id} 
                      job={job}
                      onDownload={handleDownload}
                      onDownloadAll={handleDownloadAll}
                    />
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Results */}
          {jobs.some(job => job.status === 'completed') && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-cyan-500/20 rounded-xl blur opacity-75 animate-gradient-shift"></div>
              <Card className="relative p-8 bg-black/40 backdrop-blur-sm border-white/10 border shadow-2xl">
                <h2 className="text-2xl font-serif mb-6 text-white">{t('downloadResults')}</h2>
                <ResultsSection 
                  jobs={jobs.filter(job => job.status === 'completed')}
                  onDownload={handleDownload}
                  onDownloadAll={handleDownloadAll}
                />
              </Card>
            </div>
          )}

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: <FileText className="w-6 h-6" />,
                titleKey: 'preserveFormattingTitle',
                descriptionKey: 'preserveFormattingDesc'
              },
              {
                icon: <Globe className="w-6 h-6" />,
                titleKey: 'multilingualTitle',
                descriptionKey: 'multilingualDesc'
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                titleKey: 'noLimitsTitle',
                descriptionKey: 'noLimitsDesc'
              }
            ].map((feature, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity animate-gradient-shift-fast"></div>
                <div className="relative p-6 bg-black/40 backdrop-blur-sm border-white/10 border rounded-xl shadow-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-serif text-white mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-gray-400 text-sm">{t(feature.descriptionKey)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Details */}
          <div className="relative mt-16">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500/10 to-gray-400/10 rounded-xl blur opacity-50"></div>
            <Card className="relative p-6 bg-black/20 backdrop-blur-sm border-white/5 border">
              <h3 className="text-lg font-serif text-white mb-4">How it works</h3>
              <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-400">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-400">1</span>
                  </div>
                  <p>Upload to Google Drive</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-400">2</span>
                  </div>
                  <p>Extract & analyze text</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-cyan-400">3</span>
                  </div>
                  <p>Translate via Google Sheets</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-400">4</span>
                  </div>
                  <p>Rebuild with formatting</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { 
            background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(6, 182, 212, 0.2));
          }
          25% { 
            background: linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2));
          }
          50% { 
            background: linear-gradient(45deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
          }
          75% { 
            background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2), rgba(147, 51, 234, 0.2));
          }
        }

        @keyframes gradient-shift-reverse {
          0%, 100% { 
            background: linear-gradient(-45deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2));
          }
          25% { 
            background: linear-gradient(-45deg, rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
          }
          50% { 
            background: linear-gradient(-45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2));
          }
          75% { 
            background: linear-gradient(-45deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2), rgba(236, 72, 153, 0.2));
          }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(20px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }

        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(15px) translateX(-10px); }
          50% { transform: translateY(25px) translateX(-20px); }
          75% { transform: translateY(10px) translateX(-5px); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-25px) translateX(15px) scale(1.1); }
        }

        .animate-gradient-shift {
          animation: gradient-shift 8s ease-in-out infinite;
        }

        .animate-gradient-shift-reverse {
          animation: gradient-shift-reverse 10s ease-in-out infinite;
        }

        .animate-gradient-shift-slow {
          animation: gradient-shift 12s ease-in-out infinite;
        }

        .animate-gradient-shift-fast {
          animation: gradient-shift 4s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 25s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}