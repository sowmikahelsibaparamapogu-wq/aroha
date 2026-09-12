/**
 * AI OCR Extraction and Document Verification Service
 * Simulates optical character recognition, digital barcode parsing,
 * and key-value extraction for MoTA document scrutiny.
 */

import { DocumentUpload } from '../types/scholarship';

export interface OCRSimulationParams {
  docType: DocumentUpload['type'];
  fileName: string;
  applicantName?: string;
  stCommunity?: string;
  annualIncome?: number;
  scheme?: 'NFST' | 'NOS';
  forceMismatch?: boolean;
  forceOutdated?: boolean;
}

export interface OCRResult {
  ocrStatus: 'verified' | 'mismatch' | 'flagged';
  ocrConfidence: number;
  extractedFields: Record<string, string | number>;
  mismatches: string[];
}

export async function simulateOCRExtraction(
  params: OCRSimulationParams,
  onProgress?: (percent: number, stepText: string) => void
): Promise<OCRResult> {
  const steps = [
    { p: 25, msg: 'Preprocessing image: deskewing & binarization...' },
    { p: 55, msg: 'Running neural layout analysis & text detection...' },
    { p: 85, msg: 'Extracting key-value entities & validating digital barcode...' },
    { p: 100, msg: 'Cross-referencing entities against application form...' },
  ];

  for (const step of steps) {
    if (onProgress) onProgress(step.p, step.msg);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const name = params.applicantName || 'Sowmika Helsiba Paramapogu';
  const tribe = params.stCommunity || 'Gond';
  const mismatches: string[] = [];

  // Check for intentional name mismatch simulation
  const isNameMismatchCase = 
    params.forceMismatch ||
    params.fileName.toLowerCase().includes('mismatch') ||
    params.fileName.toLowerCase().includes('lapang') ||
    (params.applicantName && params.applicantName.toLowerCase().includes('khasi') && params.docType === 'caste_certificate');

  switch (params.docType) {
    case 'caste_certificate': {
      const isMismatch = params.forceMismatch || isNameMismatchCase;
      const extractedDocName = isMismatch ? (name.includes('Khasi') ? 'Jemimah Lapang' : `${name.split(' ')[0]} Lapang`) : name;
      const parsedTribe = isMismatch && !isNameMismatchCase ? 'General / Non-ST Category' : `${tribe} (Scheduled Tribe)`;

      if (isNameMismatchCase || extractedDocName !== name) {
        mismatches.push(
          `Critical Name Mismatch: ST Certificate records name as "${extractedDocName}" whereas application records "${name}". Requires official Gazette notification or SDM affidavit.`
        );
      }
      if (isMismatch && !isNameMismatchCase) {
        mismatches.push(`Document indicates category "${parsedTribe}" which conflicts with claimed ST (${tribe}) community`);
      }

      return {
        ocrStatus: isMismatch ? 'mismatch' : 'verified',
        ocrConfidence: isMismatch ? 54 : 96,
        extractedFields: {
          'Applicant Name in Document': extractedDocName,
          'Claimed Name in Application': name,
          'Name Match Status': extractedDocName === name ? 'EXACT MATCH' : 'DISCREPANCY FLAGGED',
          'Father / Guardian': isMismatch ? 'Late Shri H. Lapang' : 'Late Shri P. Rameshwar',
          'Community / Tribe': parsedTribe,
          'State / UT': isMismatch ? 'Meghalaya' : 'Telangana',
          'Issuing Authority': isMismatch ? 'Sub-Divisional Officer (SDO), East Khasi Hills' : 'Sub-Divisional Magistrate (SDM), Adilabad',
          'Certificate Format': isMismatch ? 'Legacy Non-Digital (1998 Format)' : 'Digital e-District Barcode',
          'Digital Barcode': isMismatch ? 'UNVERIFIED (Manual Register Format)' : 'VALID (e-Pramaan Barcode Verified)',
          'Issue Date': isMismatch ? '14-August-2017' : '18-May-2023',
        },
        mismatches,
      };
    }

    case 'income_certificate': {
      const isOutdated = params.forceOutdated;
      const isMismatch = params.forceMismatch;
      const reportedIncome = params.annualIncome || 480000;
      const parsedIncome = isMismatch ? 920000 : reportedIncome;
      const issueYear = isOutdated ? '2021-2022' : '2024-2025';

      if (isOutdated) {
        mismatches.push(`Certificate issued for Financial Year ${issueYear}. MoTA guidelines require income certificate for current FY (2024-25).`);
      }
      if (isMismatch) {
        mismatches.push(`Certificate shows annual income ₹9,20,000, exceeding NOS statutory cap (₹8,00,000).`);
      }

      return {
        ocrStatus: isOutdated || isMismatch ? 'mismatch' : 'verified',
        ocrConfidence: isOutdated || isMismatch ? 64 : 94,
        extractedFields: {
          'Head of Household': name,
          'Annual Family Income (INR)': parsedIncome,
          'Income in Words': formatIndianCurrency(parsedIncome),
          'Financial Year': issueYear,
          'Issuing Authority': 'Tahsildar, Revenue Department, Govt of Telangana',
          'Certificate Number': `IC/2024/${Math.floor(100000 + Math.random() * 900000)}`,
          'Verification Stamp': 'Digitally Signed with DSC Barcode',
        },
        mismatches,
      };
    }

    case 'marksheet': {
      const isMismatch = params.forceMismatch;
      const pct = isMismatch ? 51.5 : 72.8;
      if (pct < 55.0) {
        mismatches.push(`Qualifying degree aggregate is ${pct}%, failing the MoTA minimum 55% ST requirement.`);
      }
      return {
        ocrStatus: pct < 55.0 ? 'mismatch' : 'verified',
        ocrConfidence: 97,
        extractedFields: {
          'Candidate Name': name,
          'Roll / Registration No': '21PG80912',
          'Degree Awarded': 'Master of Science (M.Sc) in Biotechnology',
          'University / Institute': 'University of Hyderabad (Central University)',
          'Year of Passing': '2024',
          'Aggregate Percentage': `${pct}%`,
          'Division': pct >= 60 ? 'First Division' : 'Second Division',
        },
        mismatches,
      };
    }

    case 'offer_letter': {
      const isMismatch = params.forceMismatch;
      const offerType = isMismatch ? 'Conditional (Subject to IELTS 7.5 & Visa)' : 'Unconditional';
      const qsRank = isMismatch ? 620 : 28;
      if (isMismatch) {
        mismatches.push(`Offer is "${offerType}". NOS strictly mandates an Unconditional admission offer.`);
        mismatches.push(`University QS Rank (#${qsRank}) exceeds prescribed top 500 ceiling.`);
      }
      return {
        ocrStatus: isMismatch ? 'mismatch' : 'verified',
        ocrConfidence: isMismatch ? 72 : 95,
        extractedFields: {
          'Applicant Name': name,
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
        ocrStatus: 'verified',
        ocrConfidence: 96,
        extractedFields: {
          'Candidate Name': name,
          'NTA UGC-NET Roll No': 'TG01004829',
          'Exam Cycle': 'UGC-NET / JRF June 2024',
          'Subject': 'Tribal Studies and Social Anthropology',
          'JRF Award Status': 'AWARDED (Category 1: JRF & Asst. Professor)',
          'NTA Score (Percentile)': '98.42',
          'Research Topic': 'Ethno-botanical Knowledge and Livelihoods of Gond Tribes in Eastern Ghats',
        },
        mismatches: [],
      };
    }

    case 'passport': {
      return {
        ocrStatus: 'verified',
        ocrConfidence: 99,
        extractedFields: {
          'Given Names': name,
          'Nationality': 'INDIAN',
          'Passport Number': 'Z8291048',
          'Place of Issue': 'Hyderabad',
          'Date of Expiry': '14-Nov-2032',
          'MRZ Code': 'P<IND<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
        },
        mismatches: [],
      };
    }

    default: {
      return {
        ocrStatus: 'verified',
        ocrConfidence: 90,
        extractedFields: {
          'Document Title': params.fileName,
          'Extracted Text Blocks': '48 blocks verified with official seal',
          'Verification Status': 'Authentic',
        },
        mismatches: [],
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
