export interface UserProfile {
  name: string;
  email: string;
  industry: string;
  company: string;
  position: string;
}

export interface UserResponses {
  q1: string; // Business/audience challenge
  q2: string; // Owned asset
  q3: string; // Lived moment & desired outcome
  ownedMediaThought?: string; // Optional API context; not collected in the current UI
}

export interface AssetFamilyScore {
  family: 'Recognition' | 'Data' | 'Story & Content' | 'Physical';
  description: string; // One sentence linking current use to the projected opportunity
  currentUtilization: number | null; // Client-provided percentage, otherwise unknown
  opportunityPotential: number | null; // Client-provided percentage, otherwise unknown
  evidence?: string; // Exact supporting excerpt from the client's answers
  currentUse?: string;
  answerRefs?: string[];
  isPrimaryCandidate: boolean;
}

export interface DimensionRating {
  name: string;
  score: number | null; // Whole-point 1 - 5 assessment, or unknown
  notes: string;
  evidence?: string;
  answerRefs?: string[];
}

export interface AssetMatrixItem {
  name: string;
  potentialScore: number | null; // 1 - 5 assessment, or unknown
  readinessScore: number | null;
  nextStep: string;
  evidence?: string;
  answerRefs?: string[];
  placement?: 'unlock' | 'pilot' | 'monitor' | 'support' | 'unknown';
}

export interface AuditInsights {
  assetMatrix: AssetMatrixItem[];
  // Panel 1: Business Tension & Lived Moment
  businessTension: {
    headline: string;
    summary: string;
    coreDifficulty: string;
    targetBehavior: string;
    audience?: string;
    opportunityHypothesis?: string;
    openQuestions?: string[];
    evidence?: string;
    answerRefs?: string[];
  };
  livedMoment: {
    touchpoint: string;
    frequency: string;
    currentPerception: 'Ignored' | 'Transactional' | 'Friction' | 'Under-measured' | 'Not provided';
    desiredOutcome: string;
    attentionGap: string;
  };

  // Panel 2 (Graph 1): 4 Owned-Asset Families Breakdown
  assetFamilies: AssetFamilyScore[];
  familyInsight: string;

  // Panel 3 (Graph 2): Potential vs Readiness Matrix
  prioritization: {
    potentialScore: number | null;
    readinessScore: number | null;
    quadrant: 'Shape a Pilot Now' | 'Name the Unlock' | 'Supporting Role' | 'Park It' | 'Needs more information';
    evidence?: string;
    openQuestions?: string[];
    quadrantAction: string;
    potentialBreakdown: DimensionRating[];
    readinessBreakdown: DimensionRating[];
  };

  // Panel 4: Smallest Credible Pilot Card
  pilotCard: {
    headline: string;
    oneAudience: string;
    oneTouchpoint: string;
    oneChange: string;
    successSignal: string;
    accountableOwner: string;
    guardrail: string;
  };

  // Panel 5: Strategic Synthesis & Action
  synthesis: {
    closingQuote: string;
    strategicSummary: string;
    quickWin: string;
    fullAuditNote: string;
  };

  source: 'gemini' | 'demo';
}

