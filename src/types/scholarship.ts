/**
 * Core types for AROHA - AI-Enabled Scholarship & Fellowship Management System
 * Ministry of Tribal Affairs (MoTA), Government of India
 */

export type SchemeType = 'NFST' | 'NOS';

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'ocr_verified'
  | 'flagged_deficiency'
  | 'in_scrutiny'
  | 'approved'
  | 'merit_listed'
  | 'rejected'
  | 'dbt_active';

export type UserRole = 'applicant' | 'admin';

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  identifier: string; // Application ID or Officer ID
  avatar?: string;
  avatarType?: string;
  designation?: string;
  community?: string;
  state?: string;
  scheme?: SchemeType;
  associatedAppId?: string;
  department?: string;
  token?: string;
}

export interface DocumentUpload {
  id: string;
  type: 
    | 'caste_certificate' 
    | 'income_certificate' 
    | 'marksheet' 
    | 'offer_letter' 
    | 'bonafide_certificate' 
    | 'passport' 
    | 'aadhaar';
  name: string;
  size: number;
  uploadedAt: string;
  dataUrl?: string; // For offline storage and preview
  ocrStatus: 'idle' | 'processing' | 'verified' | 'mismatch' | 'flagged';
  ocrConfidence: number; // 0 to 100
  extractedFields: Record<string, string | number>;
  mismatches?: string[];
  offlineQueued?: boolean;
}

export interface DeficiencyNotice {
  id: string;
  documentId?: string;
  field?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'critical';
  issuedAt: string;
  resolvedAt?: string;
  isResolved: boolean;
  applicantResponse?: string;
  replacementDocId?: string;
}

export interface DBTDisbursementRecord {
  trancheNumber: number;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'pfms_verified' | 'disbursed';
  expectedDate: string;
  disbursedDate?: string;
  utrNumber?: string;
  dbtAccountLast4: string;
}

export interface Application {
  id: string;
  applicationNumber: string;
  scheme: SchemeType;
  submittedAt: string;
  updatedAt: string;
  status: ApplicationStatus;
  
  // Applicant details
  applicant: {
    fullName: string;
    fatherName: string;
    motherName: string;
    gender: 'Male' | 'Female' | 'Other';
    dob: string;
    aadhaarNumber: string; // masked in UI
    mobile: string;
    email: string;
    stCommunity: string; // e.g. Gond, Santhal, Bhil, Munda, Khasi, Bodo
    state: string;
    district: string;
    pincode: string;
    domicileState: string;
    annualFamilyIncome: number;
    parentOccupation: string;
  };

  // Academic & Scheme specifics
  academic: {
    qualifyingDegree: string; // e.g. M.Sc. Biotechnology, B.Tech Computer Science
    qualifyingPercentage: number;
    passingYear: number;
    institutionName: string;
    targetProgram: 'M.Phil' | 'Ph.D' | 'Masters' | 'Post-Doctoral';
    specialization: string;
    researchTopic?: string;
    
    // NFST specifics
    ugcNetRollNo?: string;
    ugcNetScore?: number;
    ugcNetYear?: string;
    isJrfQualified?: boolean;
    phdRegistrationDate?: string;
    guideName?: string;

    // NOS specifics
    foreignUniversityName?: string;
    countryOfStudy?: string;
    qsWorldRanking?: number;
    offerStatus?: 'Conditional' | 'Unconditional';
    courseDurationMonths?: number;
    greScore?: string;
    ieltsToeflScore?: string;
  };

  // Bank & DBT Information
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
    isAadhaarSeeded: boolean;
  };

  // Documents and OCR
  documents: DocumentUpload[];
  
  // Rule Evaluation & AI Analysis
  aiAnalysis: {
    overallConfidence: number; // 0 - 100
    eligibilityPassed: boolean;
    requiresHumanReview: boolean;
    flags: string[];
    riskScore: 'Low' | 'Medium' | 'High';
    meritScore: number; // 0 - 100
    verifiedFieldsCount: number;
    totalFieldsCount: number;
    summary: string;
  };

  // Deficiencies
  deficiencies: DeficiencyNotice[];

  // Scrutiny Details
  scrutiny?: {
    reviewedBy?: string;
    reviewedAt?: string;
    remarks?: string;
    decision?: 'approve' | 'request_info' | 'reject';
    committeeRecommendation?: string;
  };

  // Post-selection DBT
  dbtDisbursements?: DBTDisbursementRecord[];

  // Sync and Offline flags
  isOfflineDraft?: boolean;
  syncPending?: boolean;
}

export interface SchemeRuleConfig {
  scheme: SchemeType;
  title: string;
  code: string;
  academicYear: string;
  maxSlots: number;
  femaleReservationPercent: number;
  
  eligibility: {
    minQualifyingPercentage: number;
    maxAge: number | null; // null for NFST, 35 for NOS
    maxIncomeLimit: number | null; // null for NFST, 800000 for NOS
    requiresUnconditionalOffer: boolean;
    maxForeignUniversityQsRank?: number; // 500 for NOS
    mandatoryDocs: Array<'caste_certificate' | 'income_certificate' | 'marksheet' | 'offer_letter' | 'bonafide_certificate' | 'passport'>;
  };

  scoringWeights: {
    academicMerit: number; // percentage weight
    entranceOrUniversityRank: number; // percentage weight
    sopOrResearchProposal: number; // percentage weight
  };

  thresholds: {
    humanReviewConfidenceThreshold: number; // e.g. 75
    automaticVerificationThreshold: number; // e.g. 90
  };
}

export interface SystemStats {
  totalApplications: number;
  verifiedPercentage: number;
  averageProcessingDays: number;
  pendingDeficiencies: number;
  schemeBreakdown: {
    nfstCount: number;
    nosCount: number;
  };
  stateWiseCount: Record<string, number>;
}
