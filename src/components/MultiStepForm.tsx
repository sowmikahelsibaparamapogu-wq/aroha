import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Send, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Clock,
  RotateCcw,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Application, DocumentUpload, SchemeType } from '../types/scholarship';
import { DocumentUploadCard } from './DocumentUploadCard';
import { DEFAULT_SCHEME_RULES, evaluateApplication } from '../services/ruleEngine';
import { StorageEngine } from '../services/storage';
import { useLanguage } from '../context/LanguageContext';

interface MultiStepFormProps {
  initialScheme?: SchemeType;
  isOnline: boolean;
  onSubmitSuccess: (app: Application) => void;
  onToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

const ST_COMMUNITIES = [
  'Gond',
  'Santhal',
  'Bhil',
  'Munda',
  'Khasi',
  'Bodo',
  'Oraon',
  'Baiga',
  'Chenchu',
  'Warli',
  'Toda',
  'Koya',
  'Garo',
  'Mizo',
  'Lepcha',
  'Angami Naga',
];

const STATES_LIST = [
  'Jharkhand',
  'Odisha',
  'Madhya Pradesh',
  'Chhattisgarh',
  'Telangana',
  'Andhra Pradesh',
  'Meghalaya',
  'Assam',
  'Rajasthan',
  'Gujarat',
  'Maharashtra',
  'Nagaland',
  'Tripura',
];

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  initialScheme = 'NFST',
  isOnline,
  onSubmitSuccess,
  onToast,
}) => {
  const { lang, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [scheme, setScheme] = useState<SchemeType>(initialScheme);
  const [saveStatus, setSaveStatus] = useState<string>('Ready');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal & Tribal
    fullName: '',
    fatherName: '',
    motherName: '',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    dob: '2000-01-15',
    aadhaarNumber: '',
    mobile: '',
    email: '',
    stCommunity: 'Gond',
    state: 'Telangana',
    district: 'Adilabad',
    pincode: '504001',
    domicileState: 'Telangana',

    // Step 2: Academic & Track
    qualifyingDegree: 'M.Sc. in Life Sciences',
    qualifyingPercentage: 72.5,
    passingYear: 2024,
    institutionName: 'University of Hyderabad',
    targetProgram: 'Ph.D' as 'M.Phil' | 'Ph.D' | 'Masters' | 'Post-Doctoral',
    specialization: 'Tribal Pharmacognosy',
    researchTopic: 'Conservation and medicinal profiling of tribal ethnobotanical flora',
    
    // NFST
    ugcNetRollNo: 'TG01004829',
    ugcNetScore: 94.5,
    isJrfQualified: true,

    // NOS
    foreignUniversityName: 'University of Oxford',
    countryOfStudy: 'United Kingdom',
    qsWorldRanking: 3,
    offerStatus: 'Unconditional' as 'Conditional' | 'Unconditional',
    courseDurationMonths: 24,

    // Step 3: Finance & DBT Bank
    annualFamilyIncome: 360000,
    parentOccupation: 'Traditional Agriculture & Forest Allied',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: 'SBIN0020491',
    bankName: 'State Bank of India',
    branchName: 'Adilabad Branch',
    isAadhaarSeeded: true,
  });

  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [isSampleDropdownOpen, setIsSampleDropdownOpen] = useState(false);
  const [activeSampleNotice, setActiveSampleNotice] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close sample dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSampleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load existing draft from IndexedDB on mount or scheme change
  useEffect(() => {
    let isMounted = true;
    const loadDraft = async () => {
      const draft = await StorageEngine.getDraft(scheme);
      if (draft && isMounted) {
        if (draft.applicant) {
          setFormData((prev) => ({
            ...prev,
            fullName: draft.applicant?.fullName || prev.fullName,
            fatherName: draft.applicant?.fatherName || prev.fatherName,
            motherName: draft.applicant?.motherName || prev.motherName,
            gender: draft.applicant?.gender || prev.gender,
            dob: draft.applicant?.dob || prev.dob,
            aadhaarNumber: draft.applicant?.aadhaarNumber || prev.aadhaarNumber,
            mobile: draft.applicant?.mobile || prev.mobile,
            email: draft.applicant?.email || prev.email,
            stCommunity: draft.applicant?.stCommunity || prev.stCommunity,
            state: draft.applicant?.state || prev.state,
            district: draft.applicant?.district || prev.district,
            pincode: draft.applicant?.pincode || prev.pincode,
            annualFamilyIncome: draft.applicant?.annualFamilyIncome || prev.annualFamilyIncome,
            parentOccupation: draft.applicant?.parentOccupation || prev.parentOccupation,
          }));
        }
        if (draft.academic) {
          setFormData((prev) => ({
            ...prev,
            qualifyingDegree: draft.academic?.qualifyingDegree || prev.qualifyingDegree,
            qualifyingPercentage: draft.academic?.qualifyingPercentage || prev.qualifyingPercentage,
            passingYear: draft.academic?.passingYear || prev.passingYear,
            institutionName: draft.academic?.institutionName || prev.institutionName,
            targetProgram: draft.academic?.targetProgram || prev.targetProgram,
            specialization: draft.academic?.specialization || prev.specialization,
            researchTopic: draft.academic?.researchTopic || prev.researchTopic,
            ugcNetRollNo: draft.academic?.ugcNetRollNo || prev.ugcNetRollNo,
            ugcNetScore: draft.academic?.ugcNetScore || prev.ugcNetScore,
            foreignUniversityName: draft.academic?.foreignUniversityName || prev.foreignUniversityName,
            qsWorldRanking: draft.academic?.qsWorldRanking || prev.qsWorldRanking,
            offerStatus: draft.academic?.offerStatus || prev.offerStatus,
          }));
        }
        if (draft.documents && draft.documents.length > 0) {
          setDocuments(draft.documents);
        }
        setLastSavedTime(draft.updatedAt ? new Date(draft.updatedAt).toLocaleTimeString() : null);
      }
    };

    loadDraft();
    return () => {
      isMounted = false;
    };
  }, [scheme]);

  // Debounced Auto-Save to IndexedDB
  useEffect(() => {
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    setSaveStatus('Saving changes...');
    autosaveTimeoutRef.current = setTimeout(async () => {
      const draftApp: Partial<Application> & { scheme: SchemeType } = {
        scheme,
        applicant: {
          fullName: formData.fullName,
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          gender: formData.gender,
          dob: formData.dob,
          aadhaarNumber: formData.aadhaarNumber,
          mobile: formData.mobile,
          email: formData.email,
          stCommunity: formData.stCommunity,
          state: formData.state,
          district: formData.district,
          pincode: formData.pincode,
          domicileState: formData.domicileState,
          annualFamilyIncome: formData.annualFamilyIncome,
          parentOccupation: formData.parentOccupation,
        },
        academic: {
          qualifyingDegree: formData.qualifyingDegree,
          qualifyingPercentage: formData.qualifyingPercentage,
          passingYear: formData.passingYear,
          institutionName: formData.institutionName,
          targetProgram: formData.targetProgram,
          specialization: formData.specialization,
          researchTopic: formData.researchTopic,
          ugcNetRollNo: formData.ugcNetRollNo,
          ugcNetScore: formData.ugcNetScore,
          isJrfQualified: formData.isJrfQualified,
          foreignUniversityName: formData.foreignUniversityName,
          countryOfStudy: formData.countryOfStudy,
          qsWorldRanking: formData.qsWorldRanking,
          offerStatus: formData.offerStatus,
          courseDurationMonths: formData.courseDurationMonths,
        },
        bankDetails: {
          accountHolderName: formData.accountHolderName || formData.fullName,
          accountNumber: formData.accountNumber || '38192019482',
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          branchName: formData.branchName,
          isAadhaarSeeded: formData.isAadhaarSeeded,
        },
        documents,
      };

      await StorageEngine.saveDraft(draftApp);
      setSaveStatus('Auto-saved to IndexedDB');
      setLastSavedTime(new Date().toLocaleTimeString());
    }, 600);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [formData, documents, scheme]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocumentUploaded = (doc: DocumentUpload) => {
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.type !== doc.type);
      return [...filtered, doc];
    });
    onToast('success', 'Document Processed', `${doc.name} scanned via AI OCR (${doc.ocrConfidence}% confidence).`);
  };

  const handleDocumentRemoved = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Evaluate application in real-time
  const partialApp: Partial<Application> = {
    scheme,
    applicant: {
      fullName: formData.fullName || 'Candidate',
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      gender: formData.gender,
      dob: formData.dob,
      aadhaarNumber: formData.aadhaarNumber || 'XXXX-XXXX-0000',
      mobile: formData.mobile,
      email: formData.email,
      stCommunity: formData.stCommunity,
      state: formData.state,
      district: formData.district,
      pincode: formData.pincode,
      domicileState: formData.domicileState,
      annualFamilyIncome: Number(formData.annualFamilyIncome),
      parentOccupation: formData.parentOccupation,
    },
    academic: {
      qualifyingDegree: formData.qualifyingDegree,
      qualifyingPercentage: Number(formData.qualifyingPercentage),
      passingYear: Number(formData.passingYear),
      institutionName: formData.institutionName,
      targetProgram: formData.targetProgram,
      specialization: formData.specialization,
      researchTopic: formData.researchTopic,
      ugcNetRollNo: formData.ugcNetRollNo,
      ugcNetScore: Number(formData.ugcNetScore),
      isJrfQualified: formData.isJrfQualified,
      foreignUniversityName: formData.foreignUniversityName,
      countryOfStudy: formData.countryOfStudy,
      qsWorldRanking: Number(formData.qsWorldRanking),
      offerStatus: formData.offerStatus,
      courseDurationMonths: Number(formData.courseDurationMonths),
    },
    bankDetails: {
      accountHolderName: formData.accountHolderName || formData.fullName,
      accountNumber: formData.accountNumber || '38192019482',
      ifscCode: formData.ifscCode,
      bankName: formData.bankName,
      branchName: formData.branchName,
      isAadhaarSeeded: formData.isAadhaarSeeded,
    },
    documents,
  };

  const evaluation = evaluateApplication(partialApp, DEFAULT_SCHEME_RULES[scheme]);

  const handleSubmit = async () => {
    const appNum = `${scheme}/2025/${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const finalizedApp: Application = {
      id: `app_${Date.now()}`,
      applicationNumber: appNum,
      scheme,
      submittedAt: now,
      updatedAt: now,
      status: !isOnline ? 'draft' : evaluation.requiresHumanReview ? 'in_scrutiny' : 'ocr_verified',
      applicant: partialApp.applicant!,
      academic: partialApp.academic!,
      bankDetails: partialApp.bankDetails!,
      documents: documents.map((d) => ({
        ...d,
        offlineQueued: !isOnline,
      })),
      aiAnalysis: {
        overallConfidence: evaluation.overallConfidence,
        eligibilityPassed: evaluation.passed,
        requiresHumanReview: evaluation.requiresHumanReview,
        flags: evaluation.flags,
        riskScore: evaluation.riskScore,
        meritScore: evaluation.meritScore,
        verifiedFieldsCount: evaluation.verifiedFieldsCount,
        totalFieldsCount: evaluation.totalFieldsCount,
        summary: evaluation.summary,
      },
      deficiencies: evaluation.generatedDeficiencies,
      isOfflineDraft: !isOnline,
      syncPending: !isOnline,
    };

    // Save to IndexedDB
    const existingApps = await StorageEngine.getApplications();
    await StorageEngine.saveApplications([finalizedApp, ...existingApps]);
    await StorageEngine.clearDraft(scheme);

    if (!isOnline) {
      // Queue documents for offline sync
      for (const doc of documents) {
        await StorageEngine.queueDocument(doc);
      }
      onToast(
        'warning',
        'Application Saved Offline',
        `Application #${appNum} stored securely on device. Will auto-sync when network reconnects.`
      );
    } else {
      onToast(
        'success',
        'Application Submitted Successfully',
        `Application #${appNum} submitted. AI OCR Verification complete (${evaluation.overallConfidence}% confidence).`
      );
    }

    onSubmitSuccess(finalizedApp);
  };

  const loadSamplePreset = (presetType: 'mismatch' | 'clean' | 'nos_variation') => {
    setIsSampleDropdownOpen(false);

    if (presetType === 'mismatch') {
      // ⚠️ TEST CASE: Name Mismatch in ST Caste Certificate
      // Application records candidate as "Jemimah Khasi", but official ST Certificate reads "Jemimah Lapang"
      setScheme('NFST');
      setCurrentStep(1);
      setFormData((prev) => ({
        ...prev,
        fullName: 'Jemimah Khasi',
        fatherName: 'Late H. Lapang Khasi',
        motherName: 'Phira Khasi',
        gender: 'Female',
        dob: '1997-08-14',
        aadhaarNumber: 'XXXX-XXXX-9140',
        mobile: '+91 98620 48192',
        email: 'jemimah.khasi@nehu.ac.in',
        stCommunity: 'Khasi',
        state: 'Meghalaya',
        district: 'East Khasi Hills',
        pincode: '793022',
        domicileState: 'Meghalaya',
        qualifyingDegree: 'M.A. in Linguistics',
        qualifyingPercentage: 69.2,
        passingYear: 2023,
        institutionName: 'North-Eastern Hill University (NEHU)',
        targetProgram: 'Ph.D',
        specialization: 'Tribal Dialects & Phonology',
        researchTopic: 'Documentation, Phonetic Atlas, and Lexicography of Endangered War-Jaintia and Khasi Dialects',
        ugcNetRollNo: 'ML01002910',
        ugcNetScore: 94.1,
        isJrfQualified: true,
        annualFamilyIncome: 290000,
        parentOccupation: 'Traditional Horticulture & Handloom',
        accountHolderName: 'Jemimah Khasi',
        accountNumber: '10928192049',
        ifscCode: 'SBIN0001815',
        bankName: 'State Bank of India',
        branchName: 'NEHU Campus Branch, Shillong',
        isAadhaarSeeded: true,
      }));

      // Pre-attach documents WITH the name mismatch in caste certificate
      setDocuments([
        {
          id: `doc_khasi_caste_${Date.now()}`,
          type: 'caste_certificate',
          name: 'ST_Certificate_EastKhasiHills_Old.pdf',
          size: 612000,
          uploadedAt: new Date().toISOString(),
          ocrStatus: 'mismatch',
          ocrConfidence: 54,
          extractedFields: {
            'Applicant Name in Document': 'Jemimah Lapang',
            'Claimed Name in Application': 'Jemimah Khasi',
            'Name Verification Status': 'DISCREPANCY DETECTED',
            'Discrepancy Detail': 'Surname mismatch ("Lapang" on Certificate vs "Khasi" in Form)',
            'Father / Guardian': 'Late Shri H. Lapang',
            'Community / Tribe': 'Khasi (Scheduled Tribe)',
            'State / UT': 'Meghalaya',
            'Issuing Authority': 'Sub-Divisional Officer (SDO), East Khasi Hills',
            'Certificate Format': '1998 Legacy Handwritten Register (No QR code)',
            'e-District Verification': 'FAILED (QR code missing)',
          },
          mismatches: [
            'Critical Name Mismatch: ST Certificate records name as "Jemimah Lapang" whereas application records "Jemimah Khasi".',
            'Discrepancy: Candidate registered surname as "Khasi" while certificate records clan name "Lapang". Requires official Gazette notification or SDM affidavit.',
            'Certificate lacks mandatory e-District digital QR verification barcode as per MoTA 2024 guidelines.',
          ],
        },
        {
          id: `doc_khasi_marks_${Date.now()}`,
          type: 'marksheet',
          name: 'MA_Linguistics_Consolidated_Marksheet.pdf',
          size: 890000,
          uploadedAt: new Date().toISOString(),
          ocrStatus: 'verified',
          ocrConfidence: 98,
          extractedFields: {
            'Candidate Name': 'Jemimah Khasi',
            'Degree Awarded': 'Master of Arts in Linguistics',
            'University': 'North-Eastern Hill University (NEHU)',
            'Aggregate Percentage': '69.2%',
            'Year of Passing': '2023',
            'Division': 'First Class',
          },
          mismatches: [],
        },
        {
          id: `doc_khasi_bonafide_${Date.now()}`,
          type: 'bonafide_certificate',
          name: 'UGC_NET_JRF_Award_Letter_2024.pdf',
          size: 470000,
          uploadedAt: new Date().toISOString(),
          ocrStatus: 'verified',
          ocrConfidence: 96,
          extractedFields: {
            'Candidate Name': 'Jemimah Khasi',
            'NTA Roll Number': 'ML01002910',
            'Subject': 'Linguistics & Tribal Anthropology',
            'Percentile': '94.1',
            'Award Category': 'Junior Research Fellowship (JRF)',
          },
          mismatches: [],
        },
      ]);

      setActiveSampleNotice('name_mismatch');
      onToast(
        'warning',
        'Sample Loaded: Document Name Mismatch',
        'Loaded Jemimah Khasi. ST Caste Certificate has name "Jemimah Lapang" to test AI OCR discrepancy & scrutiny desk.'
      );
    } else if (presetType === 'clean') {
      setScheme('NFST');
      setCurrentStep(1);
      setFormData((prev) => ({
        ...prev,
        fullName: 'Sowmika Helsiba Paramapogu',
        fatherName: 'P. Rameshwar',
        motherName: 'P. Sharada',
        gender: 'Female',
        dob: '1998-04-12',
        aadhaarNumber: 'XXXX-XXXX-8921',
        mobile: '+91 98480 12345',
        email: 'sowmikahelsibaparamapogu@gmail.com',
        stCommunity: 'Gond',
        state: 'Telangana',
        district: 'Adilabad',
        pincode: '504001',
        domicileState: 'Telangana',
        qualifyingDegree: 'M.Sc. in Biotechnology',
        qualifyingPercentage: 74.5,
        passingYear: 2024,
        institutionName: 'University of Hyderabad',
        targetProgram: 'Ph.D',
        specialization: 'Tribal Pharmacognosy & Indigenous Medicine',
        researchTopic: 'Bioactive compounds from sacred groves of Eastern Ghats and their ethnopharmacological validation',
        ugcNetRollNo: 'TG01004829',
        ugcNetScore: 98.42,
        isJrfQualified: true,
        annualFamilyIncome: 340000,
        parentOccupation: 'Forest Produce & Agriculture',
        accountHolderName: 'Sowmika Helsiba Paramapogu',
        accountNumber: '38192019482',
        ifscCode: 'SBIN0020491',
        bankName: 'State Bank of India',
        branchName: 'Adilabad Main Branch',
        isAadhaarSeeded: true,
      }));

      setDocuments([
        {
          id: `doc_sowmika_caste_${Date.now()}`,
          type: 'caste_certificate',
          name: 'Gond_ST_Certificate_Adilabad.pdf',
          size: 780000,
          uploadedAt: new Date().toISOString(),
          ocrStatus: 'verified',
          ocrConfidence: 99,
          extractedFields: {
            'Applicant Name': 'Sowmika Helsiba Paramapogu',
            'Community': 'Gond (ST)',
            'Digital Barcode': 'VALID (e-Pramaan Government Barcode Verified)',
          },
          mismatches: [],
        },
        {
          id: `doc_sowmika_marks_${Date.now()}`,
          type: 'marksheet',
          name: 'MSc_Biotech_Transcripts_UoH.pdf',
          size: 1100000,
          uploadedAt: new Date().toISOString(),
          ocrStatus: 'verified',
          ocrConfidence: 97,
          extractedFields: {
            'Candidate Name': 'Sowmika Helsiba Paramapogu',
            'Aggregate Percentage': '74.5%',
            'Institution': 'University of Hyderabad',
          },
          mismatches: [],
        },
        {
          id: `doc_sowmika_net_${Date.now()}`,
          type: 'bonafide_certificate',
          name: 'UGC_NET_JRF_Award_Letter.pdf',
          size: 530000,
          uploadedAt: new Date().toISOString(),
          ocrStatus: 'verified',
          ocrConfidence: 99,
          extractedFields: {
            'Candidate Name': 'Sowmika Helsiba Paramapogu',
            'Score Percentile': '98.42',
            'JRF Status': 'Awarded',
          },
          mismatches: [],
        },
      ]);

      setActiveSampleNotice(null);
      onToast('success', 'Sample Loaded: Clean Application', 'Loaded Sowmika Helsiba with 100% verified matching documents.');
    } else if (presetType === 'nos_variation') {
      setScheme('NOS');
      setCurrentStep(1);
      setFormData((prev) => ({
        ...prev,
        fullName: 'Birsa Dev Munda',
        fatherName: 'Ganga Munda',
        motherName: 'Sukri Munda',
        gender: 'Male',
        dob: '1995-11-20',
        aadhaarNumber: 'XXXX-XXXX-4819',
        mobile: '+91 94311 55678',
        email: 'birsa.munda.nos@gov.in',
        stCommunity: 'Munda',
        state: 'Jharkhand',
        district: 'Khunti',
        pincode: '835210',
        domicileState: 'Jharkhand',
        qualifyingDegree: 'B.Tech in Metallurgical Engineering',
        qualifyingPercentage: 78.5,
        passingYear: 2023,
        institutionName: 'IIT Kharagpur',
        targetProgram: 'Masters',
        specialization: 'Advanced Materials & Sustainable Metallurgy',
        foreignUniversityName: 'University of Oxford',
        countryOfStudy: 'United Kingdom',
        qsWorldRanking: 3,
        offerStatus: 'Unconditional',
        annualFamilyIncome: 480000,
        parentOccupation: 'Rural Educator & Cooperative Lead',
        accountHolderName: 'Birsa Dev Munda',
        accountNumber: '20938102941',
        ifscCode: 'BARB0KHUNTI',
        bankName: 'Bank of Baroda',
        branchName: 'Khunti Branch',
        isAadhaarSeeded: true,
      }));

      setDocuments([
        {
          id: `doc_nos_caste_${Date.now()}`,
          type: 'caste_certificate',
          name: 'Munda_ST_Certificate_Khunti.pdf',
          size: 820000,
          uploadedAt: new Date().toISOString(),
          ocrStatus: 'verified',
          ocrConfidence: 98,
          extractedFields: {
            'Applicant Name': 'Birsa Dev Munda',
            'Community': 'Munda (Scheduled Tribe)',
          },
          mismatches: [],
        },
        {
          id: `doc_nos_income_${Date.now()}`,
          type: 'income_certificate',
          name: 'Income_Certificate_FY25.pdf',
          size: 690000,
          uploadedAt: new Date().toISOString(),
          ocrStatus: 'verified',
          ocrConfidence: 96,
          extractedFields: {
            'Head of Household': 'Birsa Dev Munda',
            'Annual Family Income (INR)': 480000,
          },
          mismatches: [],
        },
        {
          id: `doc_nos_offer_${Date.now()}`,
          type: 'offer_letter',
          name: 'Oxford_MSc_Materials_Admission_Letter.pdf',
          size: 1200000,
          uploadedAt: new Date().toISOString(),
          ocrStatus: 'mismatch',
          ocrConfidence: 74,
          extractedFields: {
            'Applicant Name in Document': 'Dev Birsa Munda',
            'Claimed Name in Application': 'Birsa Dev Munda',
            'Institution': 'University of Oxford',
            'Offer Status': 'Unconditional',
            'QS World Ranking': 3,
          },
          mismatches: [
            'Name Discrepancy: Foreign university admission letter names candidate as "Dev Birsa Munda" whereas Indian Passport records "Birsa Dev Munda".',
          ],
        },
        {
          id: `doc_nos_marks_${Date.now()}`,
          type: 'marksheet',
          name: 'IIT_Kharagpur_Final_Degree.pdf',
          size: 940000,
          uploadedAt: new Date().toISOString(),
          ocrStatus: 'verified',
          ocrConfidence: 98,
          extractedFields: {
            'Candidate Name': 'Birsa Dev Munda',
            'Aggregate Percentage': '78.5%',
          },
          mismatches: [],
        },
      ]);

      setActiveSampleNotice('nos_variation');
      onToast('warning', 'Sample Loaded: NOS Name Discrepancy', 'Loaded Birsa Dev Munda with Oxford offer letter name discrepancy.');
    }
  };

  // Direct helper defaults to loading the Name Mismatch test case requested
  const loadPresetData = () => {
    loadSamplePreset('mismatch');
  };

  const steps = [
    { number: 1, label: t('step1Title') },
    { number: 2, label: t('step2Title') },
    { number: 3, label: t('step3Title') },
    { number: 4, label: t('step4Title') },
    { number: 5, label: t('step5Title') },
  ];

  const casteDoc = documents.find((d) => d.type === 'caste_certificate');
  const hasNameMismatchInDoc = Boolean(
    casteDoc?.ocrStatus === 'mismatch' &&
    (casteDoc.extractedFields?.['Applicant Name in Document'] ||
      casteDoc.mismatches?.some((m) => m.toLowerCase().includes('name') || m.toLowerCase().includes('lapang')))
  );
  const mismatchedDocName =
    (casteDoc?.extractedFields?.['Applicant Name in Document'] as string) || 'Jemimah Lapang';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 max-w-4xl mx-auto">
      {/* Form Top Bar: Scheme Selector + Offline Autosave Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {t('appForm')}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {saveStatus === 'Ready' ? t('ready') : saveStatus === 'Saving changes...' ? t('saving') : t('autoSaved')} {lastSavedTime ? `${t('at')} ${lastSavedTime}` : ''}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {scheme === 'NFST' ? t('schemeNFST') : t('schemeNOS')}
          </h2>
        </div>

        {/* Scheme Switcher & Preset Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick 1-Click Button for Name Mismatch Scenario */}
          <button
            type="button"
            onClick={() => loadSamplePreset('mismatch')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 rounded-xl transition cursor-pointer shadow-xs"
            title="Load dataset with deliberate name mismatch between application and ST certificate"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('loadMismatchBtn')}</span>
          </button>

          {/* Sample Data Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsSampleDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition cursor-pointer"
              title="Select a sample test dataset"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('allPresets')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
            </button>

            {isSampleDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in"
              >
                <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t('selectTestData')}
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                    {t('ocrScenarios')}
                  </span>
                </div>

                <div className="py-1 space-y-1">
                  {/* Option 1: Name Mismatch in Document */}
                  <button
                    type="button"
                    onClick={() => loadSamplePreset('mismatch')}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        {t('presetMismatchTitle')}
                      </span>
                      <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                        Discrepancy
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 group-hover:text-amber-900 mt-1 leading-relaxed">
                      {t('presetMismatchDesc')}
                    </p>
                  </button>

                  {/* Option 2: Clean Verified Application */}
                  <button
                    type="button"
                    onClick={() => loadSamplePreset('clean')}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {t('presetCleanTitle')}
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        100% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 group-hover:text-emerald-900 mt-1 leading-relaxed">
                      {t('presetCleanDesc')}
                    </p>
                  </button>

                  {/* Option 3: NOS Name Variation */}
                  <button
                    type="button"
                    onClick={() => loadSamplePreset('nos_variation')}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        {t('presetNosTitle')}
                      </span>
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        NOS Abroad
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 group-hover:text-blue-900 mt-1 leading-relaxed">
                      {t('presetNosDesc')}
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setScheme('NFST');
                setCurrentStep(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                scheme === 'NFST' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              NFST (Ph.D)
            </button>
            <button
              type="button"
              onClick={() => {
                setScheme('NOS');
                setCurrentStep(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                scheme === 'NOS' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              NOS (Abroad)
            </button>
          </div>
        </div>
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="py-6">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;

            return (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s.number)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.number}
                  </button>
                  <span className={`text-[11px] mt-1.5 font-medium hidden md:block text-center max-w-[100px] ${
                    isCurrent ? 'text-blue-600 font-bold' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      currentStep > s.number ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Sample Notice Banner */}
      {(activeSampleNotice === 'name_mismatch' || hasNameMismatchInDoc) && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl text-amber-950 shadow-xs animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-300">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                    Sample Data Active: Document Name Discrepancy Test Case
                  </h4>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                    AI OCR Flag Triggered
                  </span>
                </div>
                <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                  The applicant form specifies <strong>"{formData.fullName}"</strong>, but the uploaded ST Caste Certificate records the candidate's name as{' '}
                  <span className="font-bold text-rose-800 underline bg-rose-50 px-1 py-0.5 rounded">
                    "{mismatchedDocName}"
                  </span>
                  .
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 bg-white/90 px-2 py-1 rounded-lg border border-amber-200 font-medium text-slate-700">
                    Step 1: Form Name = <strong>{formData.fullName}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/90 px-2 py-1 rounded-lg border border-amber-200 font-medium text-rose-700">
                    Step 4: ST Certificate = <strong>{mismatchedDocName}</strong> (Mismatch)
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/90 px-2 py-1 rounded-lg border border-amber-200 font-medium text-amber-800">
                    Step 5: Review & Submit = <strong>Requires Scrutiny Desk</strong>
                  </span>
                </div>
              </div>
            </div>
            {activeSampleNotice && (
              <button
                type="button"
                onClick={() => setActiveSampleNotice(null)}
                className="text-amber-700 hover:text-amber-900 text-xs font-semibold px-2 py-1 rounded-md hover:bg-amber-200/50 transition cursor-pointer"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Form Step Content */}
      <div className="mt-4">
        {/* Step 1: Personal & Tribal Profile */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-blue-950">{t('statutoryVerificationNote') || 'Statutory Verification Note'}:</strong> {t('statutoryVerificationText') || 'Ensure your full name and ST community match your official Tehsildar/SDM issued Scheduled Tribe Certificate.'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('fullName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
                {hasNameMismatchInDoc && (
                  <div className="mt-2 p-2.5 bg-rose-50/90 rounded-xl border border-rose-200 text-rose-900 text-[11px] flex items-start gap-2 shadow-xs animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-950">{t('discrepancyDetected')}:</span> The attached ST Certificate names the applicant as{' '}
                      <span className="font-bold underline text-rose-700">"{mismatchedDocName}"</span>, differing from the entered name <strong>"{formData.fullName}"</strong>.
                      <p className="mt-0.5 text-[10px] text-rose-700">
                        {t('mismatchWarning')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('fatherName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  placeholder={t('fatherNamePlaceholder')}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('stCommunity')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.stCommunity}
                  onChange={(e) => handleInputChange('stCommunity', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  {ST_COMMUNITIES.map((tribe) => (
                    <option key={tribe} value={tribe}>
                      {tribe} (ST)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('gender')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="Female">{t('female')} (30% / 33% {t('slotsQuota') || 'Quota'})</option>
                  <option value="Male">{t('male')}</option>
                  <option value="Other">{t('other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('dob')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
                {scheme === 'NOS' && (
                  <p className="text-[11px] text-slate-400 mt-1">Age ceiling: 35 years as on 1st July 2025</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('aadhaarNumber')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                  placeholder={t('aadhaarPlaceholder')}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('stateOfResidence')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  {STATES_LIST.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('district')} & {t('pincode')} <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    placeholder={t('district')}
                    className="w-2/3 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder={t('pincode')}
                    className="w-1/3 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Academic & Track */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('qualifyingDegree')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.qualifyingDegree}
                  onChange={(e) => handleInputChange('qualifyingDegree', e.target.value)}
                  placeholder={t('qualifyingDegreePlaceholder')}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('aggregatePercentage')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.qualifyingPercentage}
                  onChange={(e) => handleInputChange('qualifyingPercentage', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Minimum statutory cutoff: 55.0% for ST applicants</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('yearOfPassing')} & {t('institutionName')} <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.passingYear}
                    onChange={(e) => handleInputChange('passingYear', e.target.value)}
                    className="w-1/3 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <input
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) => handleInputChange('institutionName', e.target.value)}
                    placeholder={t('institutionNamePlaceholder')}
                    className="w-2/3 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('targetProgram')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.targetProgram}
                  onChange={(e) => handleInputChange('targetProgram', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  {scheme === 'NFST' ? (
                    <>
                      <option value="Ph.D">Ph.D (Doctor of Philosophy)</option>
                      <option value="M.Phil">M.Phil (Integrated / Full-time)</option>
                    </>
                  ) : (
                    <>
                      <option value="Masters">Master's Degree (Abroad)</option>
                      <option value="Ph.D">Ph.D (Doctoral Abroad)</option>
                      <option value="Post-Doctoral">Post-Doctoral Research</option>
                    </>
                  )}
                </select>
              </div>

              {scheme === 'NFST' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('ugcNetRollNo')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.ugcNetRollNo}
                      onChange={(e) => handleInputChange('ugcNetRollNo', e.target.value)}
                      placeholder={t('ugcNetRollNoPlaceholder')}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('ugcNetScore')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.ugcNetScore}
                      onChange={(e) => handleInputChange('ugcNetScore', e.target.value)}
                      placeholder={t('ugcNetScorePlaceholder')}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('foreignUniversity')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.foreignUniversityName}
                      onChange={(e) => handleInputChange('foreignUniversityName', e.target.value)}
                      placeholder={t('foreignUniversityPlaceholder')}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('qsWorldRanking')} & {t('offerStatus')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.qsWorldRanking}
                        onChange={(e) => handleInputChange('qsWorldRanking', e.target.value)}
                        placeholder="QS Rank"
                        className="w-1/3 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <select
                        value={formData.offerStatus}
                        onChange={(e) => handleInputChange('offerStatus', e.target.value)}
                        className="w-2/3 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                      >
                        <option value="Unconditional">{t('unconditional') || 'Unconditional Offer (Mandatory for NOS)'}</option>
                        <option value="Conditional">{t('conditional') || 'Conditional Offer (Requires Clearance)'}</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('researchTopic')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.researchTopic}
                  onChange={(e) => handleInputChange('researchTopic', e.target.value)}
                  placeholder={t('researchTopicPlaceholder')}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Finance & DBT Bank Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">{t('bankDbtDetails')}:</strong> {t('aadhaarSeededNote')}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('annualFamilyIncome')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.annualFamilyIncome}
                  onChange={(e) => handleInputChange('annualFamilyIncome', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
                {scheme === 'NOS' ? (
                  <p className="text-[11px] text-orange-600 mt-1 font-medium">
                    {t('incomeCeilingNote')}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    No family income ceiling for NFST fellowship
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('parentOccupation')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.parentOccupation}
                  onChange={(e) => handleInputChange('parentOccupation', e.target.value)}
                  placeholder={t('parentOccupationPlaceholder')}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('bankName')} & {t('branchName')} <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder={t('bankNamePlaceholder')}
                    className="w-1/2 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => handleInputChange('branchName', e.target.value)}
                    placeholder={t('branchNamePlaceholder')}
                    className="w-1/2 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('accountNumber')} & {t('ifscCode')} <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    placeholder={t('accountNumberPlaceholder')}
                    className="w-2/3 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                    placeholder={t('ifscPlaceholder')}
                    className="w-1/3 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAadhaarSeeded}
                    onChange={(e) => handleInputChange('isAadhaarSeeded', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>
                    {t('aadhaarSeededNote')}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Documents & Instant AI OCR */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  <strong>{t('docsTitle')}:</strong> {t('docsSubtitle')}
                </span>
              </div>
            </div>

            <DocumentUploadCard
              docType="caste_certificate"
              title={t('docTypeCaste')}
              description="Official certificate issued by competent revenue authority (SDM/Tehsildar) with digital QR code or e-District barcode."
              scheme={scheme}
              applicantName={formData.fullName}
              stCommunity={formData.stCommunity}
              annualIncome={Number(formData.annualFamilyIncome)}
              document={documents.find((d) => d.type === 'caste_certificate')}
              onUploadComplete={handleDocumentUploaded}
              onRemove={handleDocumentRemoved}
              isOnline={isOnline}
            />

            {scheme === 'NOS' && (
              <DocumentUploadCard
                docType="income_certificate"
                title={t('docTypeIncome')}
                description="Valid income certificate issued by competent authority for current FY (statutory limit ₹8,00,000)."
                scheme={scheme}
                applicantName={formData.fullName}
                annualIncome={Number(formData.annualFamilyIncome)}
                document={documents.find((d) => d.type === 'income_certificate')}
                onUploadComplete={handleDocumentUploaded}
                onRemove={handleDocumentRemoved}
                isOnline={isOnline}
              />
            )}

            <DocumentUploadCard
              docType="marksheet"
              title={t('docTypeMarks')}
              description="Marksheet showing marks in qualifying degree (minimum 55% for Scheduled Tribe candidates)."
              scheme={scheme}
              applicantName={formData.fullName}
              document={documents.find((d) => d.type === 'marksheet')}
              onUploadComplete={handleDocumentUploaded}
              onRemove={handleDocumentRemoved}
              isOnline={isOnline}
            />

            {scheme === 'NFST' ? (
              <DocumentUploadCard
                docType="bonafide_certificate"
                title={t('docTypeNet')}
                description="Official NTA score card or bonafide certificate from University Head of Department confirming enrollment."
                scheme={scheme}
                applicantName={formData.fullName}
                document={documents.find((d) => d.type === 'bonafide_certificate')}
                onUploadComplete={handleDocumentUploaded}
                onRemove={handleDocumentRemoved}
                isOnline={isOnline}
              />
            ) : (
              <>
                <DocumentUploadCard
                  docType="offer_letter"
                  title={t('docTypeOffer')}
                  description="Formal letter confirming unconditional admission into top 500 QS ranked university."
                  scheme={scheme}
                  applicantName={formData.fullName}
                  document={documents.find((d) => d.type === 'offer_letter')}
                  onUploadComplete={handleDocumentUploaded}
                  onRemove={handleDocumentRemoved}
                  isOnline={isOnline}
                />

                <DocumentUploadCard
                  docType="passport"
                  title="Valid Indian Passport"
                  description="Front and back pages of passport valid for at least 6 months beyond intended departure."
                  scheme={scheme}
                  applicantName={formData.fullName}
                  document={documents.find((d) => d.type === 'passport')}
                  onUploadComplete={handleDocumentUploaded}
                  onRemove={handleDocumentRemoved}
                  isOnline={isOnline}
                />
              </>
            )}
          </div>
        )}

        {/* Step 5: Review & AI Eligibility Verdict */}
        {currentStep === 5 && (
          <div className="space-y-6">
            {/* AI Eligibility Result Summary Box */}
            <div className={`p-5 rounded-xl border ${
              evaluation.passed
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {evaluation.passed ? (
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {evaluation.passed ? t('verifiedApproved') : t('flaggedMismatch')}
                    </h4>
                    <p className="text-xs mt-0.5 opacity-90">{evaluation.summary}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                    {t('confidence')}
                  </span>
                  <span className="text-lg font-extrabold">{evaluation.overallConfidence}%</span>
                </div>
              </div>

              {/* Borderline review indicator */}
              {evaluation.requiresHumanReview && (
                <div className="mt-3 p-2.5 bg-orange-100/70 border border-orange-200 rounded-lg text-xs text-orange-950 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>{t('flaggedMismatch')}:</strong> This application will be reviewed in the Human Scrutiny Queue prior to merit listing due to: {evaluation.flags.join(', ')}.
                  </div>
                </div>
              )}
            </div>

            {/* Offline notice if currently offline */}
            {!isOnline && (
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">{t('offlineAlert')}</strong>
                </div>
              </div>
            )}

            {/* Application Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-800 border-b border-slate-200 pb-1">{t('applicantSummary')}</h5>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('fullName')}:</span>
                  <span className="font-semibold text-slate-900">{formData.fullName || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('stCommunity')}:</span>
                  <span className="font-semibold text-slate-900">{formData.stCommunity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('stateOfResidence')}:</span>
                  <span className="font-semibold text-slate-900">{formData.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('annualFamilyIncome')}:</span>
                  <span className="font-semibold text-slate-900">₹{Number(formData.annualFamilyIncome).toLocaleString('en-IN')}/yr</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-800 border-b border-slate-200 pb-1">{t('academicSummary')}</h5>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('schemeFilter')}:</span>
                  <span className="font-semibold text-blue-700">{scheme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('aggregatePercentage')}:</span>
                  <span className="font-semibold text-slate-900">{formData.qualifyingPercentage}%</span>
                </div>
                {scheme === 'NFST' ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('ugcNetScore')}:</span>
                    <span className="font-semibold text-slate-900">{formData.ugcNetScore} Percentile</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('foreignUniversity')}:</span>
                    <span className="font-semibold text-slate-900">{formData.foreignUniversityName} (QS #{formData.qsWorldRanking})</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('documentsSummary')}:</span>
                  <span className="font-semibold text-emerald-600">{documents.length} verified</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('prevStep')}</span>
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            <span>{t('nextStep')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{!isOnline ? t('saveDraft') : t('submitApp')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
