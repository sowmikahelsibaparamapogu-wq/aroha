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
  Clock,
  XCircle,
  AlertCircle,
  Maximize2
} from 'lucide-react';
import { DocumentUpload, SchemeType } from '../types/scholarship';
import { simulateOCRExtraction } from '../services/ocrService';
import { matchEnteredFieldsWithDocument, DocumentFieldMatchResult } from '../services/fieldMatcher';
import { useLanguage } from '../context/LanguageContext';
import { DocumentViewerModal } from './DocumentViewerModal';

interface DocumentUploadCardProps {
  docType: DocumentUpload['type'];
  title: string;
  description: string;
  required?: boolean;
  scheme: SchemeType;
  applicantName?: string;
  fatherName?: string;
  stCommunity?: string;
  annualIncome?: number;
  qualifyingPercentage?: number;
  state?: string;
  offerStatus?: 'Conditional' | 'Unconditional';
  qsWorldRanking?: number;
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
  fatherName,
  stCommunity,
  annualIncome,
  qualifyingPercentage,
  state,
  offerStatus,
  qsWorldRanking,
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
  const [showFullDocModal, setShowFullDocModal] = useState(false);

  // Compute live match between entered fields and scanned document
  const matchResult: DocumentFieldMatchResult | null = document
    ? matchEnteredFieldsWithDocument(
        {
          fullName: applicantName || '',
          fatherName,
          stCommunity: stCommunity || 'Gond',
          annualFamilyIncome: annualIncome || 360000,
          qualifyingPercentage: qualifyingPercentage || 70,
          state,
          offerStatus,
          qsWorldRanking,
          scheme,
        },
        document
      )
    : null;

  const handleFileProcess = async (file: File) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStatusText(t('readingBuffer') || 'Reading document buffer...');

    // Generate local Data URL or process pre-supplied Data URL
    const processWithDataUrl = async (dataUrl: string) => {
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
        const isForcedMismatch =
          file.name.toLowerCase().includes('mismatch') ||
          file.name.toLowerCase().includes('wrong') ||
          file.name.toLowerCase().includes('lapang') ||
          file.name.toLowerCase().includes('invalid');

        const ocrResult = await simulateOCRExtraction(
          {
            docType,
            fileName: file.name,
            dataUrl,
            applicantName,
            fatherName,
            stCommunity,
            annualIncome,
            qualifyingPercentage,
            state,
            offerStatus,
            qsWorldRanking,
            scheme,
            forceMismatch: isForcedMismatch,
          },
          (pct, msg) => {
            setScanProgress(pct);
            setScanStatusText(msg);
          }
        );

        // Run deep field comparison against entered form fields
        const testMatch = matchEnteredFieldsWithDocument(
          {
            fullName: applicantName || '',
            fatherName,
            stCommunity: stCommunity || 'Gond',
            annualFamilyIncome: annualIncome || 360000,
            qualifyingPercentage: qualifyingPercentage || 70,
            state,
            offerStatus,
            qsWorldRanking,
            scheme,
          },
          {
            id: baseDoc.id,
            name: file.name,
            type: docType,
            extractedFields: ocrResult.extractedFields,
            mismatches: ocrResult.mismatches,
          }
        );

        const hasErrors = testMatch.hasErrors || ocrResult.ocrStatus === 'mismatch';
        const combinedErrors = Array.from(
          new Set([...(ocrResult.mismatches || []), ...(testMatch.errorMessages || [])])
        );

        const finalizedDoc: DocumentUpload = {
          ...baseDoc,
          ocrStatus: hasErrors ? 'mismatch' : 'verified',
          ocrConfidence: hasErrors ? Math.min(ocrResult.ocrConfidence, 25) : ocrResult.ocrConfidence,
          extractedFields: ocrResult.extractedFields,
          mismatches: combinedErrors,
          rawText: ocrResult.rawText,
        };

        setIsScanning(false);
        onUploadComplete(finalizedDoc);
      } catch (err) {
        setIsScanning(false);
        onUploadComplete({
          ...baseDoc,
          ocrStatus: 'mismatch',
          ocrConfidence: 18,
          extractedFields: { 'File': file.name, 'Status': 'Scan Error / Incompatible' },
          mismatches: [`Scan verification failure: Unable to authenticate '${file.name}' against MoTA guidelines.`],
        });
      }
    };

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      processWithDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleTestSample = (isMismatch: boolean) => {
    const fakeFileName = isMismatch
      ? `${docType}_wrong_doc_mismatched.pdf`
      : `${docType}_verified_official.pdf`;

    const fakeFile = new File(['%PDF-1.5 MoTA Official Scholarship Document Sample'], fakeFileName, {
      type: 'application/pdf',
    });

    handleFileProcess(fakeFile);
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
            {(document.ocrStatus === 'mismatch' || matchResult?.hasErrors) ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>SCAN ERROR ({document.ocrConfidence}%)</span>
              </span>
            ) : document.ocrStatus === 'verified' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {t('ocrVerified')} ({document.ocrConfidence}%)
              </span>
            ) : null}
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

          <div className="mt-3 flex items-center justify-center gap-2 pt-2 border-t border-slate-200/60" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10.5px] text-slate-500 font-medium">Quick Test:</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTestSample(false);
              }}
              className="text-[10.5px] px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold cursor-pointer transition-colors"
            >
              ✓ Valid Document
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTestSample(true);
              }}
              className="text-[10.5px] px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold cursor-pointer transition-colors"
            >
              ⚠ Test Wrong Document
            </button>
          </div>
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
                onClick={() => setShowFullDocModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                title="View Full Document"
              >
                <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                <span>View Full Doc</span>
              </button>

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

          {/* Prominent Scan Error & Field Match Comparison */}
          {matchResult && matchResult.hasErrors ? (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs space-y-3 shadow-xs animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black flex-shrink-0">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-wider text-rose-900">
                      SCAN ERROR: ENTERED FIELDS DO NOT MATCH DOCUMENT DETAILS
                    </h5>
                    <p className="text-[11px] text-rose-700">
                      Character-by-character scan detected {matchResult.errorCount} critical mismatch{matchResult.errorCount > 1 ? 'es' : ''}.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-rose-200 text-rose-900 font-extrabold text-[10px] uppercase border border-rose-300 flex-shrink-0">
                  CRITICAL ERROR
                </span>
              </div>

              {/* Side-by-Side Field Comparison Table */}
              {matchResult.fieldComparisons.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-rose-200 bg-white">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-rose-100/70 text-rose-900 font-bold border-b border-rose-200">
                      <tr>
                        <th className="py-1.5 px-2.5">Field</th>
                        <th className="py-1.5 px-2.5">Entered in Application</th>
                        <th className="py-1.5 px-2.5">Scanned from Document</th>
                        <th className="py-1.5 px-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100 font-medium">
                      {matchResult.fieldComparisons.map((cmp, idx) => (
                        <tr key={idx} className={cmp.isMatch ? 'bg-white' : 'bg-rose-50/70'}>
                          <td className="py-2 px-2.5 text-slate-700 font-semibold">{cmp.fieldLabel}</td>
                          <td className="py-2 px-2.5 text-slate-900 font-mono">
                            <span className={cmp.isMatch ? '' : 'bg-rose-100 px-1.5 py-0.5 rounded text-rose-900 font-bold'}>
                              {String(cmp.enteredValue)}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-slate-900 font-mono">
                            <span className={cmp.isMatch ? '' : 'bg-rose-100 px-1.5 py-0.5 rounded text-rose-900 font-bold'}>
                              {String(cmp.scannedValue)}
                            </span>
                          </td>
                          <td className="py-2 px-2.5">
                            {cmp.isMatch ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matched
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-black">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" /> MISMATCH ERROR
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Exact Error Messages */}
              <div className="space-y-1 pt-1">
                {matchResult.errorMessages.map((errMsg, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-rose-100/70 border border-rose-300 text-rose-950 text-[11px] font-semibold flex items-start gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{errMsg}</span>
                  </div>
                ))}
              </div>

              <div className="p-2 rounded-lg bg-rose-200/50 text-[10.5px] text-rose-900 flex items-center justify-between">
                <span>
                  <strong>Legal Impact:</strong> Application submission with unresolved field mismatch errors will be routed to statutory rejection under MoTA guidelines.
                </span>
              </div>
            </div>
          ) : document.mismatches && document.mismatches.length > 0 ? (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-950">
                <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Document Scanning Discrepancy</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-rose-800 font-medium">
                {document.mismatches.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          ) : null}

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

      {showFullDocModal && document && (
        <DocumentViewerModal
          document={document}
          onClose={() => setShowFullDocModal(false)}
        />
      )}
    </div>
  );
};
