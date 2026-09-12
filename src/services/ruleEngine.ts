/**
 * JSON-Configurable Rule Engine for Ministry of Tribal Affairs (MoTA)
 * Schemes: National Fellowship for Scheduled Tribe (NFST) & National Overseas Scholarship (NOS)
 */

import { Application, DeficiencyNotice, SchemeRuleConfig, SchemeType } from '../types/scholarship';

export const DEFAULT_SCHEME_RULES: Record<SchemeType, SchemeRuleConfig> = {
  NFST: {
    scheme: 'NFST',
    title: 'National Fellowship for Scheduled Tribe Students (NFST)',
    code: 'MOTA-NFST-2025-26',
    academicYear: '2025-2026',
    maxSlots: 750,
    femaleReservationPercent: 33,
    eligibility: {
      minQualifyingPercentage: 55.0,
      maxAge: null, // No age limit for NFST
      maxIncomeLimit: null, // No family income ceiling for NFST
      requiresUnconditionalOffer: false,
      mandatoryDocs: ['caste_certificate', 'marksheet', 'bonafide_certificate'],
    },
    scoringWeights: {
      academicMerit: 40, // Qualifying PG marks %
      entranceOrUniversityRank: 35, // UGC-NET/CSIR-NET JRF percentile
      sopOrResearchProposal: 25, // Research proposal relevance to tribal development
    },
    thresholds: {
      humanReviewConfidenceThreshold: 75,
      automaticVerificationThreshold: 90,
    },
  },
  NOS: {
    scheme: 'NOS',
    title: 'National Overseas Scholarship for ST Candidates (NOS)',
    code: 'MOTA-NOS-2025-26',
    academicYear: '2025-2026',
    maxSlots: 20,
    femaleReservationPercent: 30,
    eligibility: {
      minQualifyingPercentage: 55.0,
      maxAge: 35,
      maxIncomeLimit: 800000, // ₹8.00 Lakh per annum ceiling as per DBT norms
      requiresUnconditionalOffer: true,
      maxForeignUniversityQsRank: 500, // Top 500 QS world ranked institution
      mandatoryDocs: ['caste_certificate', 'income_certificate', 'passport', 'offer_letter', 'marksheet'],
    },
    scoringWeights: {
      entranceOrUniversityRank: 45, // QS World Ranking tier
      academicMerit: 35, // Qualifying Degree marks %
      sopOrResearchProposal: 20, // Statement of Purpose alignment with national priorities
    },
    thresholds: {
      humanReviewConfidenceThreshold: 80,
      automaticVerificationThreshold: 92,
    },
  },
};

export interface RuleEvaluationResult {
  passed: boolean;
  requiresHumanReview: boolean;
  overallConfidence: number;
  meritScore: number;
  flags: string[];
  riskScore: 'Low' | 'Medium' | 'High';
  verifiedFieldsCount: number;
  totalFieldsCount: number;
  summary: string;
  generatedDeficiencies: DeficiencyNotice[];
}

export function evaluateApplication(
  app: Partial<Application>,
  ruleConfig: SchemeRuleConfig = DEFAULT_SCHEME_RULES[app.scheme || 'NFST']
): RuleEvaluationResult {
  const flags: string[] = [];
  const deficiencies: DeficiencyNotice[] = [];
  let confidencePoints = 0;
  let totalConfidenceWeight = 0;
  let verifiedFields = 0;
  let totalFields = 0;

  const applicant = app.applicant;
  const academic = app.academic;
  const documents = app.documents || [];

  // 1. Mandatory Document Upload Checks
  totalFields += ruleConfig.eligibility.mandatoryDocs.length;
  for (const requiredDocType of ruleConfig.eligibility.mandatoryDocs) {
    const uploaded = documents.find((d) => d.type === requiredDocType);
    totalConfidenceWeight += 15;
    if (!uploaded) {
      flags.push(`Missing mandatory document: ${formatDocType(requiredDocType)}`);
      deficiencies.push({
        id: `def_${Date.now()}_${requiredDocType}`,
        field: requiredDocType,
        title: `Missing ${formatDocType(requiredDocType)}`,
        description: `As per ${ruleConfig.scheme} guidelines, a valid ${formatDocType(requiredDocType)} must be submitted for verification.`,
        severity: 'critical',
        issuedAt: new Date().toISOString(),
        isResolved: false,
      });
    } else {
      verifiedFields++;
      confidencePoints += (uploaded.ocrConfidence / 100) * 15;
      if (uploaded.ocrStatus === 'mismatch' || (uploaded.mismatches && uploaded.mismatches.length > 0)) {
        flags.push(`OCR Mismatch on ${formatDocType(requiredDocType)}: ${uploaded.mismatches?.join(', ')}`);
        deficiencies.push({
          id: `def_${Date.now()}_${requiredDocType}_mismatch`,
          documentId: uploaded.id,
          field: requiredDocType,
          title: `Data Discrepancy in ${formatDocType(requiredDocType)}`,
          description: `OCR detected discrepancies between application form and uploaded document: ${uploaded.mismatches?.join('; ')}. Please upload an attested/clear copy.`,
          severity: 'medium',
          issuedAt: new Date().toISOString(),
          isResolved: false,
        });
      }
    }
  }

  // 2. ST Identity & Caste Verification Check
  totalFields += 2;
  totalConfidenceWeight += 20;
  if (!applicant?.stCommunity) {
    flags.push('ST Community name not specified in identity details');
  } else {
    verifiedFields++;
    const casteDoc = documents.find((d) => d.type === 'caste_certificate');
    if (casteDoc && casteDoc.ocrConfidence > 70) {
      confidencePoints += 20;
      verifiedFields++;
    } else {
      confidencePoints += 10;
      flags.push('Caste Certificate requires manual seal & signature inspection');
    }
  }

  // 3. Academic Minimum Percentage Check
  totalFields += 1;
  totalConfidenceWeight += 20;
  const marks = academic?.qualifyingPercentage || 0;
  if (marks < ruleConfig.eligibility.minQualifyingPercentage) {
    flags.push(`Qualifying percentage (${marks}%) is below scheme threshold of ${ruleConfig.eligibility.minQualifyingPercentage}%`);
    deficiencies.push({
      id: `def_acad_${Date.now()}`,
      field: 'qualifyingPercentage',
      title: 'Ineligible Academic Score',
      description: `Candidate scored ${marks}%, which does not meet the MoTA mandatory cutoff of ${ruleConfig.eligibility.minQualifyingPercentage}%.`,
      severity: 'critical',
      issuedAt: new Date().toISOString(),
      isResolved: false,
    });
  } else {
    verifiedFields++;
    confidencePoints += 20;
  }

  // 4. Scheme Specific Checks: NOS vs NFST
  if (ruleConfig.scheme === 'NOS') {
    // NOS Income Ceiling Check
    totalFields += 1;
    totalConfidenceWeight += 15;
    const income = applicant?.annualFamilyIncome || 0;
    if (ruleConfig.eligibility.maxIncomeLimit && income > ruleConfig.eligibility.maxIncomeLimit) {
      flags.push(`Annual Family Income (₹${(income / 100000).toFixed(2)}L) exceeds NOS ceiling of ₹${(ruleConfig.eligibility.maxIncomeLimit / 100000).toFixed(2)}L`);
      deficiencies.push({
        id: `def_income_${Date.now()}`,
        field: 'annualFamilyIncome',
        title: 'Income Limit Exceeded',
        description: `Family income ₹${income.toLocaleString('en-IN')} exceeds the statutory limit of ₹${ruleConfig.eligibility.maxIncomeLimit.toLocaleString('en-IN')}.`,
        severity: 'critical',
        issuedAt: new Date().toISOString(),
        isResolved: false,
      });
    } else {
      verifiedFields++;
      confidencePoints += 15;
      // Borderline check: within 10% of ceiling
      if (ruleConfig.eligibility.maxIncomeLimit && income > ruleConfig.eligibility.maxIncomeLimit * 0.9) {
        flags.push(`Income near upper cutoff (₹${(income / 100000).toFixed(2)}L / ₹${(ruleConfig.eligibility.maxIncomeLimit / 100000).toFixed(2)}L) — requires Scrutiny Officer verification`);
      }
    }

    // NOS Age Check
    if (ruleConfig.eligibility.maxAge && applicant?.dob) {
      totalFields += 1;
      totalConfidenceWeight += 10;
      const birthYear = new Date(applicant.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (age > ruleConfig.eligibility.maxAge) {
        flags.push(`Applicant age (${age} years) exceeds the maximum age limit of ${ruleConfig.eligibility.maxAge} years`);
      } else {
        verifiedFields++;
        confidencePoints += 10;
      }
    }

    // Foreign University QS Rank Check
    if (ruleConfig.eligibility.maxForeignUniversityQsRank && academic?.qsWorldRanking) {
      totalFields += 1;
      totalConfidenceWeight += 10;
      if (academic.qsWorldRanking > ruleConfig.eligibility.maxForeignUniversityQsRank) {
        flags.push(`University QS Rank (#${academic.qsWorldRanking}) outside prescribed top ${ruleConfig.eligibility.maxForeignUniversityQsRank}`);
      } else {
        verifiedFields++;
        confidencePoints += 10;
      }
    }

    // Unconditional Offer Letter Check
    if (ruleConfig.eligibility.requiresUnconditionalOffer && academic?.offerStatus === 'Conditional') {
      flags.push('Offer letter is "Conditional" — NOS guidelines strictly mandate an Unconditional Offer Letter');
      deficiencies.push({
        id: `def_offer_${Date.now()}`,
        field: 'offerStatus',
        title: 'Conditional Offer Letter Not Accepted',
        description: 'NOS guidelines mandate an Unconditional Offer of Admission. Please furnish clearance of all academic/language conditions.',
        severity: 'critical',
        issuedAt: new Date().toISOString(),
        isResolved: false,
      });
    }
  } else {
    // NFST Specifics: UGC-NET / CSIR-NET JRF
    totalFields += 1;
    totalConfidenceWeight += 20;
    if (academic?.ugcNetScore || academic?.isJrfQualified) {
      verifiedFields++;
      confidencePoints += 20;
    } else {
      confidencePoints += 10;
      flags.push('UGC-NET / CSIR-NET scorecard pending validation with NTA database');
    }
  }

  // 5. Calculate Merit Score (0 - 100)
  let meritScore = 0;
  if (ruleConfig.scheme === 'NFST') {
    const acadScore = Math.min(100, Math.max(0, marks));
    const netScore = academic?.ugcNetScore ? Math.min(100, academic.ugcNetScore) : 75;
    const researchMerit = 82; // Normalized proposal merit
    meritScore = Math.round(
      (acadScore * ruleConfig.scoringWeights.academicMerit) / 100 +
      (netScore * ruleConfig.scoringWeights.entranceOrUniversityRank) / 100 +
      (researchMerit * ruleConfig.scoringWeights.sopOrResearchProposal) / 100
    );
  } else {
    // NOS scoring
    const qsRank = academic?.qsWorldRanking || 300;
    // Lower rank = higher points (Rank 1-50: 100pts, 51-150: 90pts, 151-300: 80pts, 301-500: 70pts)
    let qsScore = 70;
    if (qsRank <= 50) qsScore = 100;
    else if (qsRank <= 150) qsScore = 90;
    else if (qsRank <= 300) qsScore = 80;

    const acadScore = Math.min(100, Math.max(0, marks));
    const sopScore = 85;
    meritScore = Math.round(
      (qsScore * ruleConfig.scoringWeights.entranceOrUniversityRank) / 100 +
      (acadScore * ruleConfig.scoringWeights.academicMerit) / 100 +
      (sopScore * ruleConfig.scoringWeights.sopOrResearchProposal) / 100
    );
  }

  // Calculate Overall Confidence %
  const overallConfidence = totalConfidenceWeight > 0 
    ? Math.round((confidencePoints / totalConfidenceWeight) * 100)
    : 70;

  // Determine Human Review trigger
  const hasCriticalDeficiency = deficiencies.some((d) => d.severity === 'critical');
  const isBorderline = overallConfidence < ruleConfig.thresholds.humanReviewConfidenceThreshold || flags.length > 0;
  const requiresHumanReview = hasCriticalDeficiency || isBorderline;

  let riskScore: 'Low' | 'Medium' | 'High' = 'Low';
  if (hasCriticalDeficiency) riskScore = 'High';
  else if (requiresHumanReview || overallConfidence < 85) riskScore = 'Medium';

  let summary = '';
  if (!hasCriticalDeficiency && overallConfidence >= ruleConfig.thresholds.automaticVerificationThreshold) {
    summary = `All statutory eligibility parameters verified successfully against MoTA ${ruleConfig.scheme} rules. High AI OCR confidence (${overallConfidence}%).`;
  } else if (hasCriticalDeficiency) {
    summary = `Candidate flagged with ${deficiencies.length} critical eligibility/document discrepancies requiring administrative resolution.`;
  } else {
    summary = `Application fulfills baseline parameters with ${flags.length} borderline items marked for Scrutiny Committee review.`;
  }

  return {
    passed: !hasCriticalDeficiency,
    requiresHumanReview,
    overallConfidence,
    meritScore,
    flags,
    riskScore,
    verifiedFieldsCount: verifiedFields,
    totalFieldsCount: totalFields,
    summary,
    generatedDeficiencies: deficiencies,
  };
}

function formatDocType(type: string): string {
  switch (type) {
    case 'caste_certificate':
      return 'ST Caste Certificate';
    case 'income_certificate':
      return 'Annual Family Income Certificate';
    case 'marksheet':
      return 'Qualifying Degree Marksheet / Transcripts';
    case 'offer_letter':
      return 'Foreign University Admission Letter';
    case 'bonafide_certificate':
      return 'Ph.D Bonafide / NET JRF Scorecard';
    case 'passport':
      return 'Valid Indian Passport';
    case 'aadhaar':
      return 'Aadhaar Card';
    default:
      return type.replace('_', ' ');
  }
}
