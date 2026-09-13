/**
 * Entered Form Fields vs. Scanned Document Match Engine
 * Character-by-character entity comparison with strict error generation.
 */

export interface ApplicationEnteredFields {
  fullName: string;
  fatherName?: string;
  stCommunity: string;
  state?: string;
  district?: string;
  annualFamilyIncome: number;
  qualifyingPercentage: number;
  ugcNetRollNo?: string;
  offerStatus?: 'Conditional' | 'Unconditional';
  qsWorldRanking?: number;
  scheme?: 'NFST' | 'NOS';
}

export interface FieldComparison {
  fieldKey: string;
  fieldLabel: string;
  enteredValue: string | number;
  scannedValue: string | number;
  isMatch: boolean;
  matchPercentage: number;
  differenceSummary: string;
  errorMessage?: string;
  severity: 'CRITICAL_ERROR' | 'WARNING' | 'VALID';
}

export interface DocumentFieldMatchResult {
  documentId: string;
  documentName: string;
  documentType: string;
  hasErrors: boolean;
  errorCount: number;
  overallMatchScore: number;
  fieldComparisons: FieldComparison[];
  errorMessages: string[];
  status: 'MATCHED_VERIFIED' | 'MISMATCH_ERROR';
}

function cleanString(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  return String(str).trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Calculates string similarity ratio (0 to 100%)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = cleanString(str1);
  const s2 = cleanString(str2);

  if (!s1 && !s2) return 100;
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 100;

  // Exact inclusion
  if (s1.includes(s2) || s2.includes(s1)) {
    const longer = Math.max(s1.length, s2.length);
    const shorter = Math.min(s1.length, s2.length);
    return Math.round((shorter / longer) * 100);
  }

  // Token-level overlap
  const tokens1 = s1.split(/[\s,.-]+/);
  const tokens2 = s2.split(/[\s,.-]+/);
  const common = tokens1.filter((t) => tokens2.includes(t));
  const union = new Set([...tokens1, ...tokens2]);

  return Math.round((common.length / union.size) * 100);
}

/**
 * Deep character and semantic matching between entered fields and scanned document details.
 */
export function matchEnteredFieldsWithDocument(
  entered: ApplicationEnteredFields,
  doc: {
    id?: string;
    name: string;
    type: string;
    extractedFields?: Record<string, string | number>;
    mismatches?: string[];
  }
): DocumentFieldMatchResult {
  const extracted = doc.extractedFields || {};
  const comparisons: FieldComparison[] = [];
  const errors: string[] = [];

  const enteredName = cleanString(entered.fullName);

  // 1. Candidate Name Verification
  const docNameCandidates = [
    extracted['Applicant Name in Document'],
    extracted['Applicant Name'],
    extracted['Candidate Name'],
    extracted['Head of Household'],
    extracted['Given Names'],
  ].filter(Boolean) as string[];

  if (docNameCandidates.length > 0) {
    const rawDocName = docNameCandidates[0];
    const cleanedDocName = cleanString(rawDocName);
    const sim = calculateSimilarity(enteredName, cleanedDocName);
    const isExact = enteredName === cleanedDocName;

    // Check surname / token divergence
    const enteredTokens = enteredName.split(' ');
    const docTokens = cleanedDocName.split(' ');
    const hasConflictingSurname =
      enteredTokens.length > 1 &&
      docTokens.length > 1 &&
      enteredTokens[enteredTokens.length - 1] !== docTokens[docTokens.length - 1];

    if (!isExact && (sim < 85 || hasConflictingSurname)) {
      const errMsg = `ERROR: Entered Name '${entered.fullName}' does not match Scanned Document Name '${rawDocName}'. Surname divergence detected ('${enteredTokens[enteredTokens.length - 1]}' ≠ '${docTokens[docTokens.length - 1]}').`;
      errors.push(errMsg);
      comparisons.push({
        fieldKey: 'fullName',
        fieldLabel: 'Applicant Full Name',
        enteredValue: entered.fullName,
        scannedValue: rawDocName,
        isMatch: false,
        matchPercentage: sim,
        differenceSummary: `Conflicting surname: Form has '${entered.fullName}' while document scans '${rawDocName}'`,
        errorMessage: errMsg,
        severity: 'CRITICAL_ERROR',
      });
    } else {
      comparisons.push({
        fieldKey: 'fullName',
        fieldLabel: 'Applicant Full Name',
        enteredValue: entered.fullName,
        scannedValue: rawDocName,
        isMatch: true,
        matchPercentage: sim,
        differenceSummary: 'Name verified with document text',
        severity: 'VALID',
      });
    }
  }

  // 2. ST Community / Tribe Verification (Caste Certificate)
  if (doc.type === 'caste_certificate') {
    const rawDocTribe = (extracted['Community / Tribe'] || '') as string;
    const cleanedDocTribe = cleanString(rawDocTribe);
    const enteredTribe = cleanString(entered.stCommunity);

    if (rawDocTribe) {
      const isCommunityMatch =
        cleanedDocTribe.includes(enteredTribe) || enteredTribe.includes(cleanedDocTribe);

      if (!isCommunityMatch || cleanedDocTribe.includes('general') || cleanedDocTribe.includes('non-st')) {
        const errMsg = `ERROR: Entered ST Community '${entered.stCommunity}' conflicts with Scanned Certificate Community '${rawDocTribe}'. Statutory ST benefit requires exact tribal match.`;
        errors.push(errMsg);
        comparisons.push({
          fieldKey: 'stCommunity',
          fieldLabel: 'ST Community / Tribe',
          enteredValue: entered.stCommunity,
          scannedValue: rawDocTribe,
          isMatch: false,
          matchPercentage: 0,
          differenceSummary: `Category conflict: Entered '${entered.stCommunity}' vs Document '${rawDocTribe}'`,
          errorMessage: errMsg,
          severity: 'CRITICAL_ERROR',
        });
      } else {
        comparisons.push({
          fieldKey: 'stCommunity',
          fieldLabel: 'ST Community / Tribe',
          enteredValue: entered.stCommunity,
          scannedValue: rawDocTribe,
          isMatch: true,
          matchPercentage: 100,
          differenceSummary: `Tribal community verified: '${entered.stCommunity}' belongs to recognized ST schedule`,
          severity: 'VALID',
        });
      }
    }

    // State / Domicile Check if present
    const rawDocState = (extracted['State / UT'] || '') as string;
    if (rawDocState && entered.state) {
      const isStateMatch = cleanString(rawDocState).includes(cleanString(entered.state));
      if (!isStateMatch) {
        const errMsg = `ERROR: Entered Domicile State '${entered.state}' does not match Certificate Issuing State '${rawDocState}'.`;
        errors.push(errMsg);
        comparisons.push({
          fieldKey: 'state',
          fieldLabel: 'State / UT of Domicile',
          enteredValue: entered.state,
          scannedValue: rawDocState,
          isMatch: false,
          matchPercentage: 40,
          differenceSummary: `State mismatch: Entered '${entered.state}' vs Document '${rawDocState}'`,
          errorMessage: errMsg,
          severity: 'CRITICAL_ERROR',
        });
      } else {
        comparisons.push({
          fieldKey: 'state',
          fieldLabel: 'State / UT of Domicile',
          enteredValue: entered.state,
          scannedValue: rawDocState,
          isMatch: true,
          matchPercentage: 100,
          differenceSummary: 'State jurisdiction verified',
          severity: 'VALID',
        });
      }
    }
  }

  // 3. Annual Family Income Verification (Income Certificate)
  if (doc.type === 'income_certificate') {
    const rawDocIncome = extracted['Annual Family Income (INR)'];
    if (rawDocIncome !== undefined) {
      const docIncomeNum = Number(rawDocIncome);
      const enteredIncomeNum = Number(entered.annualFamilyIncome);
      const diff = Math.abs(enteredIncomeNum - docIncomeNum);
      const percentDiff = enteredIncomeNum > 0 ? (diff / enteredIncomeNum) * 100 : 100;

      // Also check statutory NOS ceiling
      const exceedsCeiling = entered.scheme === 'NOS' && docIncomeNum > 800000;

      if (diff > 10000 || exceedsCeiling) {
        let errMsg = '';
        if (exceedsCeiling) {
          errMsg = `ERROR: Scanned Income Certificate shows ₹${docIncomeNum.toLocaleString('en-IN')}, EXCEEDING the statutory NOS ceiling of ₹8,00,000.`;
        } else {
          errMsg = `ERROR: Entered Income (₹${enteredIncomeNum.toLocaleString('en-IN')}) DOES NOT MATCH Scanned Certificate (₹${docIncomeNum.toLocaleString('en-IN')}). Discrepancy of ₹${diff.toLocaleString('en-IN')}.`;
        }
        errors.push(errMsg);
        comparisons.push({
          fieldKey: 'annualFamilyIncome',
          fieldLabel: 'Annual Family Income',
          enteredValue: `₹${enteredIncomeNum.toLocaleString('en-IN')}`,
          scannedValue: `₹${docIncomeNum.toLocaleString('en-IN')}`,
          isMatch: false,
          matchPercentage: Math.max(0, Math.round(100 - percentDiff)),
          differenceSummary: `Income discrepancy: Form has ₹${enteredIncomeNum} vs Scanned ₹${docIncomeNum}`,
          errorMessage: errMsg,
          severity: 'CRITICAL_ERROR',
        });
      } else {
        comparisons.push({
          fieldKey: 'annualFamilyIncome',
          fieldLabel: 'Annual Family Income',
          enteredValue: `₹${enteredIncomeNum.toLocaleString('en-IN')}`,
          scannedValue: `₹${docIncomeNum.toLocaleString('en-IN')}`,
          isMatch: true,
          matchPercentage: 100,
          differenceSummary: 'Income certified within statutory limits',
          severity: 'VALID',
        });
      }
    }
  }

  // 4. Academic Percentage Verification (Marksheet)
  if (doc.type === 'marksheet') {
    const rawDocPercentage = extracted['Aggregate Percentage'];
    if (rawDocPercentage) {
      const docPct = parseFloat(String(rawDocPercentage).replace(/[^0-9.]/g, ''));
      const enteredPct = Number(entered.qualifyingPercentage);

      const fallsShortOfSTCutoff = docPct < 55.0;
      const pctMismatch = Math.abs(enteredPct - docPct) > 1.0;

      if (fallsShortOfSTCutoff || pctMismatch) {
        let errMsg = '';
        if (fallsShortOfSTCutoff) {
          errMsg = `ERROR: Scanned Marksheet aggregate (${docPct}%) is BELOW the mandatory MoTA 55.0% cutoff for ST candidates.`;
        } else {
          errMsg = `ERROR: Entered Qualifying Percentage (${enteredPct}%) does not match Scanned Marksheet (${docPct}%).`;
        }
        errors.push(errMsg);
        comparisons.push({
          fieldKey: 'qualifyingPercentage',
          fieldLabel: 'Qualifying Degree Percentage',
          enteredValue: `${enteredPct}%`,
          scannedValue: `${docPct}%`,
          isMatch: false,
          matchPercentage: fallsShortOfSTCutoff ? 40 : 70,
          differenceSummary: `Academic score mismatch: Form has ${enteredPct}% vs Document ${docPct}%`,
          errorMessage: errMsg,
          severity: 'CRITICAL_ERROR',
        });
      } else {
        comparisons.push({
          fieldKey: 'qualifyingPercentage',
          fieldLabel: 'Qualifying Degree Percentage',
          enteredValue: `${enteredPct}%`,
          scannedValue: `${docPct}%`,
          isMatch: true,
          matchPercentage: 100,
          differenceSummary: 'Academic merit validated against university marksheet',
          severity: 'VALID',
        });
      }
    }
  }

  // 5. Offer Letter Checks (NOS Scheme)
  if (doc.type === 'offer_letter') {
    const rawOfferStatus = extracted['Offer Status'];
    if (rawOfferStatus) {
      const isConditional = String(rawOfferStatus).toLowerCase().includes('conditional');
      if (isConditional) {
        const errMsg = `ERROR: Scanned Offer Letter is '${rawOfferStatus}'. NOS statutory guidelines mandate an UNCONDITIONAL admission offer.`;
        errors.push(errMsg);
        comparisons.push({
          fieldKey: 'offerStatus',
          fieldLabel: 'Admission Offer Status',
          enteredValue: entered.offerStatus || 'Unconditional',
          scannedValue: String(rawOfferStatus),
          isMatch: false,
          matchPercentage: 20,
          differenceSummary: 'Conditional offer letter submitted. Mandatory unconditional required.',
          errorMessage: errMsg,
          severity: 'CRITICAL_ERROR',
        });
      }
    }

    const rawQsRank = extracted['QS World University Rank'];
    if (rawQsRank) {
      const rankNum = Number(rawQsRank);
      if (rankNum > 500) {
        const errMsg = `ERROR: Scanned University QS World Rank (#${rankNum}) EXCEEDS the mandatory Top 500 ceiling for NOS scholarship.`;
        errors.push(errMsg);
        comparisons.push({
          fieldKey: 'qsWorldRanking',
          fieldLabel: 'QS World University Ranking',
          enteredValue: entered.qsWorldRanking ? `#${entered.qsWorldRanking}` : 'Top 500',
          scannedValue: `#${rankNum}`,
          isMatch: false,
          matchPercentage: 30,
          differenceSummary: `QS Rank #${rankNum} exceeds Top 500 limit`,
          errorMessage: errMsg,
          severity: 'CRITICAL_ERROR',
        });
      }
    }
  }

  // Check if the document was detected as wrong, incompatible, or slot mismatched
  const lowerDocName = doc.name.toLowerCase();
  const wrongKeywords = [
    'wrong', 'fake', 'invalid', 'dummy', 'fail',
    'bill', 'receipt', 'invoice', 'electricity', 'gas', 'water', 'rent',
    'salary', 'pay_slip', 'payslip', 'bank_statement', 'passbook',
    'aadhaar', 'aadhar', 'pan_card', 'pancard', 'voter', 'driving_licence', 'dl',
    'ration', 'resume', 'cv', 'photo', 'selfie', 'screenshot',
    'cat', 'dog', 'car', 'ticket', 'tax', 'gst'
  ];

  const detectedDocType = (extracted['Document Type Detected'] as string) || '';
  let isWrongTypeSlot = false;
  if (detectedDocType) {
    const lowerDetected = detectedDocType.toLowerCase();
    if (doc.type === 'marksheet' && !lowerDetected.includes('marksheet') && !lowerDetected.includes('transcript') && !lowerDetected.includes('academic')) {
      isWrongTypeSlot = true;
    } else if (doc.type === 'caste_certificate' && !lowerDetected.includes('tribe') && !lowerDetected.includes('caste') && !lowerDetected.includes('community')) {
      isWrongTypeSlot = true;
    } else if (doc.type === 'income_certificate' && !lowerDetected.includes('income')) {
      isWrongTypeSlot = true;
    } else if (doc.type === 'offer_letter' && !lowerDetected.includes('offer') && !lowerDetected.includes('admission')) {
      isWrongTypeSlot = true;
    }
  }

  const isWrongDocument =
    wrongKeywords.some((kw) => lowerDocName.includes(kw)) ||
    isWrongTypeSlot ||
    String(extracted['Verification Status'] || '').toLowerCase().includes('incompatible');

  const detectedDisplay = detectedDocType || (extracted['Document Title'] as string) || (isWrongDocument ? 'Wrong / Incompatible File' : `${doc.type.replace('_', ' ')} Verified`);

  if (isWrongDocument) {
    const wrongDocError = `Document Incompatibility Error: Uploaded file '${doc.name}' (${detectedDisplay}) is not a valid ${doc.type.replace('_', ' ')}.`;
    if (!errors.includes(wrongDocError)) {
      errors.unshift(wrongDocError);
    }
    comparisons.unshift({
      fieldKey: 'documentValidity',
      fieldLabel: 'Document Type & Authenticity',
      enteredValue: `Mandatory ${doc.type.replace('_', ' ')}`,
      scannedValue: detectedDisplay,
      isMatch: false,
      matchPercentage: 0,
      differenceSummary: `Incompatible document: Uploaded '${doc.name}' does not satisfy statutory ${doc.type.replace('_', ' ')} specifications.`,
      errorMessage: wrongDocError,
      severity: 'CRITICAL_ERROR',
    });
  } else {
    comparisons.unshift({
      fieldKey: 'documentValidity',
      fieldLabel: 'Document Type & Authenticity',
      enteredValue: `Mandatory ${doc.type.replace('_', ' ')}`,
      scannedValue: detectedDisplay,
      isMatch: true,
      matchPercentage: 100,
      differenceSummary: `Document classification verified: Valid ${doc.type.replace('_', ' ')} format`,
      severity: 'VALID',
    });
  }

  // Include any extra pre-existing mismatches from document OCR
  if (doc.mismatches && doc.mismatches.length > 0) {
    for (const m of doc.mismatches) {
      if (!errors.includes(m)) {
        errors.push(m);
      }
    }
  }

  const hasErrors = errors.length > 0;
  const matchSum = comparisons.reduce((acc, c) => acc + c.matchPercentage, 0);
  const rawScore = comparisons.length > 0 ? Math.round(matchSum / comparisons.length) : hasErrors ? 15 : 100;
  const overallMatchScore = hasErrors ? Math.min(rawScore, 25) : rawScore;

  return {
    documentId: doc.id || `doc_${Date.now()}`,
    documentName: doc.name,
    documentType: doc.type,
    hasErrors,
    errorCount: errors.length,
    overallMatchScore,
    fieldComparisons: comparisons,
    errorMessages: errors,
    status: hasErrors ? 'MISMATCH_ERROR' : 'MATCHED_VERIFIED',
  };
}

/**
 * Cross-checks all uploaded documents against the application's entered fields.
 */
export function matchAllDocumentsWithEnteredFields(
  entered: ApplicationEnteredFields,
  docs: Array<{
    id?: string;
    name: string;
    type: string;
    extractedFields?: Record<string, string | number>;
    mismatches?: string[];
  }>
): DocumentFieldMatchResult[] {
  return docs.map((doc) => matchEnteredFieldsWithDocument(entered, doc));
}
