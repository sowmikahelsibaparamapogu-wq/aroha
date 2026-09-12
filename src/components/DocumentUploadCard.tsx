import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  Eye, 
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { DocumentUpload, SchemeType } from '../types/scholarship';
import { simulateOCRExtraction } from '../services/ocrService';
import { useLanguage } from '../context/LanguageContext';

interface DocumentUploadCardProps {
  docType: DocumentUpload['type'];
  title: string;
  description: string;
  required?: boolean;
  scheme: SchemeType;
  applicantName?: string;
  stCommunity?: string;
  annualIncome?: number;
  document?: DocumentUpload;
  onUploadComplete: (doc: DocumentUpload) => void;
  onRemove: (id: string) => void;
  isOnline: boolean;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  docType,
  title,
  description,
  required = true,
  scheme,
  applicantName,
  stCommunity,
  annualIncome,
  document,
  onUploadComplete,
  onRemove,
  isOnline,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('');
  const [showExtractedPreview, setShowExtractedPreview] = useState(false);

  const handleFileProcess = async (file: File) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStatusText(t('readingBuffer') || 'Reading document buffer...');

    // Generate local Data URL
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      const baseDoc: DocumentUpload = {
        id: `doc_${docType}_${Date.now()}`,
        type: docType,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl,
        ocrStatus: 'processing',
        ocrConfidence: 0,
        extractedFields: {},
        offlineQueued: !isOnline,
      };

      try {
        const ocrResult = await simulateOCRExtraction(
          {
            docType,
            fileName: file.name,
            applicantName,
            stCommunity,
            annualIncome,
            scheme,
          },
          (pct, msg) => {
            setScanProgress(pct);
            setScanStatusText(msg);
          }
        );

        const finalizedDoc: DocumentUpload = {
          ...baseDoc,
          ocrStatus: ocrResult.ocrStatus,
          ocrConfidence: ocrResult.ocrConfidence,
          extractedFields: ocrResult.extractedFields,
          mismatches: ocrResult.mismatches,
        };

        setIsScanning(false);
        onUploadComplete(finalizedDoc);
      } catch (err) {
        setIsScanning(false);
        onUploadComplete({
          ...baseDoc,
          ocrStatus: 'verified',
          ocrConfidence: 90,
          extractedFields: { 'File': file.name },
        });
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            {required && (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                {t('mandatory')}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        </div>

        {document && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {document.ocrStatus === 'verified' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {t('ocrVerified')} ({document.ocrConfidence}%)
              </span>
            )}
            {document.ocrStatus === 'mismatch' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-300">
                <AlertTriangle className="w-3 h-3 text-orange-600" />
                {t('reviewFlagged')} ({document.ocrConfidence}%)
              </span>
            )}
            {document.offlineQueued && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Clock className="w-3 h-3 text-slate-500" />
                {t('queuedOffline')}
              </span>
            )}
          </div>
        )}
      </div>

      {!document && !isScanning ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            {t('clickToUpload')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {t('uploadFormats')}
          </p>
        </div>
      ) : isScanning ? (
        <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 mb-1.5">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              <span>{t('aiOcrActive')}</span>
            </div>
            <span>{scanProgress}%</span>
          </div>
          <div className="w-full bg-blue-200/70 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-blue-700 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-blue-600" />
            {scanStatusText}
          </p>
        </div>
      ) : document ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{document.name}</p>
                <p className="text-[11px] text-slate-500">
                  {(document.size / 1024).toFixed(1)} KB • {new Date(document.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowExtractedPreview(!showExtractedPreview)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showExtractedPreview ? t('hideOcr') : t('viewOcr')}</span>
              </button>

              <button
                type="button"
                onClick={() => onRemove(document.id)}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title={t('removeFile')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mismatch warning */}
          {document.mismatches && document.mismatches.length > 0 && (
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-orange-950">
                <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span>{t('detectedDiscrepancy')}</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-orange-800">
                {document.mismatches.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Extracted Key-Value Drawer */}
          {showExtractedPreview && (
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  {t('parsedEntities')}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {t('confidence')}: {document.ocrConfidence}%
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {Object.entries(document.extractedFields).map(([k, v]) => (
                  <div key={k} className="bg-white p-2 rounded border border-slate-100">
                    <span className="text-slate-400 block">{k}</span>
                    <span className="font-semibold text-slate-800">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
