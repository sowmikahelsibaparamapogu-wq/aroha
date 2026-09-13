/**
 * AI OCR Extraction and Document Verification Service
 * Simulates optical character recognition, digital barcode parsing,
 * and key-value extraction for MoTA document scrutiny.
 */

import { DocumentUpload } from '../types/scholarship';

export interface OCRSimulationParams {
  docType: DocumentUpload['type'];
  fileName: string;
  dataUrl?: string;
  applicantName?: string;
  fatherName?: string;
  stCommunity?: string;
  annualIncome?: number;
  qualifyingPercentage?: number;
  state?: string;
  offerStatus?: string;
  qsWorldRanking?: number;
  scheme?: 'NFST' | 'NOS';
  forceMismatch?: boolean;
  forceOutdated?: boolean;
}

export interface OCRResult {
  ocrStatus: 'verified' | 'mismatch' | 'flagged';
  ocrConfidence: number;
  extractedFields: Record<string, string | number>;
  mismatches: string[];
  rawText?: string;
}

export async function simulateOCRExtraction(
  params: OCRSimulationParams,
  onProgress?: (percent: number, stepText: string) => void
): Promise<OCRResult> {
  const steps = [
    { p: 20, msg: 'Preprocessing image: deskewing, de-noising & binarization...' },
    { p: 45, msg: 'Running deep neural layout analysis & statutory OCR...' },
    { p: 75, msg: 'Extracting key-value entities, e-Pramaan seals & digital barcode...' },
    { p: 95, msg: 'Forensic cross-examination against claimed application fields...' },
  ];

  for (const step of steps) {
    if (onProgress) onProgress(step.p, step.msg);
    await new Promise((resolve) => setTimeout(resolve, 180));
  }

  // 1. Try Live Server-Side AI Verification via Gemini Vision & Heuristics
  try {
    const res = await fetch('/api/scan-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        if (onProgress) onProgress(100, 'Verification complete.');
        return {
          ocrStatus: data.ocrStatus || (data.isWrongDocument ? 'mismatch' : 'verified'),
          ocrConfidence: data.ocrConfidence ?? (data.isWrongDocument ? 20 : 94),
          extractedFields: data.extractedFields || {},
          mismatches: data.mismatches || [],
          rawText: data.rawText || '',
        };
      }
    }
  } catch (err) {
    console.warn('Network call to /api/scan-document failed, running offline heuristic scanner:', err);
  }

  // 2. Offline / Client-Side Heuristic Fallback
  if (onProgress) onProgress(100, 'Verification complete.');

  const name = params.applicantName || 'Sowmika Helsiba Paramapogu';
  const tribe = params.stCommunity || 'Gond';
  const lowerName = params.fileName.toLowerCase();

  const wrongKeywords = [
    'wrong', 'fake', 'invalid', 'dummy', 'test', 'fail', 'mismatch', 'lapang',
    'bill', 'receipt', 'invoice', 'electricity', 'gas', 'water', 'rent',
    'salary', 'pay_slip', 'payslip', 'bank_statement', 'passbook',
    'aadhaar', 'aadhar', 'pan_card', 'pancard', 'voter', 'driving_licence', 'dl',
    'ration', 'resume', 'cv', 'photo', 'selfie', 'screenshot', 'random',
    'cat', 'dog', 'car', 'ticket', 'tax', 'gst'
  ];
  const isWrongFile = params.forceMismatch || wrongKeywords.some((kw) => lowerName.includes(kw));

  let slotMismatch = false;
  let slotMismatchMessage = '';
  if (params.docType === 'caste_certificate' && (lowerName.includes('income') || lowerName.includes('mark') || lowerName.includes('offer') || lowerName.includes('passport') || lowerName.includes('bill'))) {
    slotMismatch = true;
    slotMismatchMessage = `Wrong Document Slot: Uploaded file '${params.fileName}' appears to be a different document type, not a Caste Certificate.`;
  } else if (params.docType === 'income_certificate' && (lowerName.includes('caste') || lowerName.includes('tribe') || lowerName.includes('mark') || lowerName.includes('passport'))) {
    slotMismatch = true;
    slotMismatchMessage = `Wrong Document Slot: Uploaded file '${params.fileName}' appears to be a different document type, not an Income Certificate.`;
  } else if (params.docType === 'marksheet' && (lowerName.includes('caste') || lowerName.includes('income') || lowerName.includes('offer') || lowerName.includes('passport'))) {
    slotMismatch = true;
    slotMismatchMessage = `Wrong Document Slot: Uploaded file '${params.fileName}' appears to be a different document type, not an Academic Marksheet.`;
  }

  const isDiscrepancy = isWrongFile || slotMismatch;
  const mismatches: string[] = [];
  if (slotMismatchMessage) {
    mismatches.push(slotMismatchMessage);
  }

  const isDifferentCandidate =
    isWrongFile ||
    lowerName.includes('different') ||
    lowerName.includes('deepak') ||
    lowerName.includes('rahul') ||
    lowerName.includes('mismatch');

  const differentCandidateName = 'DEEPAK VERMA';
  const extractedDocName = isDifferentCandidate ? differentCandidateName : name;

  switch (params.docType) {
    case 'caste_certificate': {
      const parsedTribe = isDiscrepancy ? 'Kurmi (OBC - Non-ST Category)' : `${tribe} (Scheduled Tribe)`;

      if (isDifferentCandidate) {
        mismatches.push(
          `Candidate Name Mismatch: Certificate scanned name '${extractedDocName}' does not match entered applicant '${name}'.`
        );
      }
      if (isDiscrepancy) {
        mismatches.push(`Document indicates category "${parsedTribe}" which fails statutory Article 342 ST requirement.`);
      }

      return {
        ocrStatus: isDiscrepancy ? 'mismatch' : 'verified',
        ocrConfidence: isDiscrepancy ? 20 : 96,
        extractedFields: {
          'Document Type Detected': slotMismatch ? 'Wrong / Incompatible File' : 'Scheduled Tribe Certificate',
          'Applicant Name in Document': extractedDocName,
          'Candidate Name': extractedDocName,
          'Father / Guardian': isDifferentCandidate ? 'Shri SURENDRA VERMA' : (params.fatherName || 'Late Shri P. Rameshwar'),
          'Community / Tribe': parsedTribe,
          'State / UT': isDiscrepancy ? 'Jharkhand' : (params.state || 'Telangana'),
          'Issuing Authority': isDiscrepancy ? 'Sub-Divisional Officer, Ranchi' : 'Sub-Divisional Magistrate (SDM), Adilabad',
          'Digital Barcode': isDiscrepancy ? 'INVALID / CANNOT BE VERIFIED' : 'VALID (e-Pramaan Barcode Verified)',
          'Issue Date': isDiscrepancy ? '14-August-2017' : '18-May-2023',
        },
        mismatches,
      };
    }

    case 'income_certificate': {
      const isOutdated = params.forceOutdated || isDiscrepancy;
      const reportedIncome = params.annualIncome || 360000;
      const parsedIncome = isDiscrepancy ? 980000 : reportedIncome;
      const issueYear = isOutdated ? '2021-2022' : '2024-2025';

      if (isDifferentCandidate) {
        mismatches.push(
          `Candidate Name Mismatch: Income certificate belongs to '${extractedDocName}' vs application '${name}'.`
        );
      }
      if (isOutdated) {
        mismatches.push(`Certificate issued for Financial Year ${issueYear}. MoTA guidelines require income certificate for current FY (2024-25).`);
      }
      if (parsedIncome > 800000 && params.scheme === 'NOS') {
        mismatches.push(`Certificate shows annual income ₹${parsedIncome.toLocaleString('en-IN')}, exceeding NOS statutory cap (₹8,00,000).`);
      }

      return {
        ocrStatus: isDiscrepancy ? 'mismatch' : 'verified',
        ocrConfidence: isDiscrepancy ? 22 : 94,
        extractedFields: {
          'Document Type Detected': slotMismatch ? 'Wrong / Incompatible File' : 'Annual Income Certificate',
          'Head of Household': extractedDocName,
          'Applicant Name in Document': extractedDocName,
          'Annual Family Income (INR)': parsedIncome,
          'Income in Words': formatIndianCurrency(parsedIncome),
          'Financial Year': issueYear,
          'Issuing Authority': 'Tahsildar, Revenue Department',
          'Certificate Number': `IC/2024/${Math.floor(100000 + Math.random() * 900000)}`,
          'Verification Stamp': isDiscrepancy ? 'Unverified Stamp' : 'Digitally Signed with DSC Barcode',
        },
        mismatches,
      };
    }

    case 'marksheet': {
      const pct = isDifferentCandidate
        ? 68.2
        : (lowerName.includes('low') || lowerName.includes('fail'))
        ? 49.0
        : (params.qualifyingPercentage || 74.5);

      if (isDifferentCandidate) {
        mismatches.push(
          `Candidate Name Mismatch: Marksheet records '${extractedDocName}' differing from entered applicant '${name}'.`
        );
      }
      if (params.qualifyingPercentage && Math.abs(pct - params.qualifyingPercentage) > 0.5) {
        mismatches.push(
          `Qualifying Degree Percentage Mismatch: Scanned degree aggregate is ${pct}%, differing from application entry of ${params.qualifyingPercentage}%.`
        );
      }
      if (pct < 55.0) {
        mismatches.push(`Qualifying degree aggregate is ${pct}%, failing the MoTA minimum 55% ST requirement.`);
      }

      return {
        ocrStatus: isDiscrepancy ? 'mismatch' : 'verified',
        ocrConfidence: isDiscrepancy ? 24 : 97,
        extractedFields: {
          'Document Type Detected': slotMismatch ? 'Wrong / Incompatible File' : 'Academic Marksheet / Transcript',
          'Candidate Name': extractedDocName,
          'Applicant Name in Document': extractedDocName,
          'Father / Guardian': isDifferentCandidate ? 'Shri SURENDRA VERMA' : (params.fatherName || 'P. Rameshwar'),
          'Roll / Registration No': isDifferentCandidate ? '2023-BT-8942' : '2022-PG-7819',
          'Degree Awarded': isDifferentCandidate ? 'Bachelor of Technology in Computer Science' : 'Master of Science (M.Sc)',
          'University / Institute': isDifferentCandidate ? 'State Board of Technical Education' : 'Central University',
          'Year of Passing': '2023',
          'Aggregate Percentage': `${pct}%`,
          'Division': pct >= 60 ? 'First Division' : 'Second Division',
        },
        mismatches,
      };
    }

    case 'offer_letter': {
      const offerType = isDiscrepancy ? 'Conditional (Subject to IELTS 7.5 & Visa)' : 'Unconditional';
      const qsRank = isDiscrepancy ? 620 : 28;
      if (isDiscrepancy) {
        mismatches.push(`Offer is "${offerType}". NOS strictly mandates an Unconditional admission offer.`);
        mismatches.push(`University QS Rank (#${qsRank}) exceeds prescribed top 500 ceiling.`);
      }
      return {
        ocrStatus: isDiscrepancy ? 'mismatch' : 'verified',
        ocrConfidence: isDiscrepancy ? 25 : 95,
        extractedFields: {
          'Applicant Name': isDiscrepancy ? 'Mismatched Candidate' : name,
          'Institution': 'University of Melbourne, Australia',
          'QS World University Rank': qsRank,
          'Program of Study': 'Master of Environment & Resource Economics',
          'Offer Status': offerType,
          'Session Intake': 'Semester 1, 2025',
          'Faculty Dean': 'Prof. Caroline M., Dean of Graduate Studies',
        },
        mismatches,
      };
    }

    case 'bonafide_certificate': {
      return {
        ocrStatus: isDiscrepancy ? 'mismatch' : 'verified',
        ocrConfidence: isDiscrepancy ? 20 : 96,
        extractedFields: {
          'Candidate Name': isDiscrepancy ? 'Unverified Student' : name,
          'NTA UGC-NET Roll No': isDiscrepancy ? 'INVALID_ROLL' : 'TG01004829',
          'Exam Cycle': 'UGC-NET / JRF June 2024',
          'Subject': 'Tribal Studies and Social Anthropology',
          'JRF Award Status': isDiscrepancy ? 'NOT QUALIFIED' : 'AWARDED (Category 1: JRF & Asst. Professor)',
          'NTA Score (Percentile)': isDiscrepancy ? '42.10' : '98.42',
        },
        mismatches: isDiscrepancy ? ['UGC-NET / JRF roll number unverified against NTA official database.'] : [],
      };
    }

    case 'passport': {
      return {
        ocrStatus: isDiscrepancy ? 'mismatch' : 'verified',
        ocrConfidence: isDiscrepancy ? 22 : 99,
        extractedFields: {
          'Given Names': isDiscrepancy ? 'Non-Matching Name' : name,
          'Nationality': 'INDIAN',
          'Passport Number': 'Z8291048',
          'Date of Expiry': isDiscrepancy ? '14-Nov-2022 (Expired)' : '14-Nov-2032',
        },
        mismatches: isDiscrepancy ? ['Passport has expired. Active valid passport required for overseas travel.'] : [],
      };
    }

    default: {
      return {
        ocrStatus: isDiscrepancy ? 'mismatch' : 'verified',
        ocrConfidence: isDiscrepancy ? 20 : 90,
        extractedFields: {
          'Document Title': params.fileName,
          'Verification Status': isDiscrepancy ? 'INCOMPATIBLE / DISCREPANCY DETECTED' : 'Authentic',
        },
        mismatches: isDiscrepancy ? [`Unrecognized or incompatible document file: '${params.fileName}'.`] : [],
      };
    }
  }
}

function formatIndianCurrency(num: number): string {
  if (num >= 100000) {
    const lakhs = (num / 100000).toFixed(2);
    return `Rupees ${lakhs} Lakhs Only`;
  }
  return `Rupees ${num.toLocaleString('en-IN')} Only`;
}
