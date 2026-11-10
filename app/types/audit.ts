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
  ownedMediaThought?: string; // Thought collected during processing
}

export interface AssetFamilyScore {
  family: 'Recognition' | 'Data' | 'Story & Content' | 'Physical';
  description: string;
  currentUtilization: number; // 0 - 100
  opportunityPotential: number; // 0 - 100
  isPrimaryCandidate: boolean;
}

export interface DimensionRating {
  name: string;
  score: number; // 1 - 5
  notes: string;
}

export interface AssetMatrixItem {
  name: string;
  potentialScore: number; // 1 - 5; 3 or above is high
  readinessScore: number; // 1 - 5; 3 or above is high
  nextStep: string;
}

export interface AuditInsights {
  assetMatrix: AssetMatrixItem[];
  // Panel 1: Business Tension & Lived Moment
  businessTension: {
    headline: string;
    summary: string;
    coreDifficulty: string;
    targetBehavior: string;
  };
  livedMoment: {
    touchpoint: string;
    frequency: string;
    currentPerception: 'Ignored' | 'Transactional' | 'Friction' | 'Under-measured';
    desiredOutcome: string;
    attentionGap: string;
  };

  // Panel 2 (Graph 1): 4 Owned-Asset Families Breakdown
  assetFamilies: AssetFamilyScore[];
  familyInsight: string;

  // Panel 3 (Graph 2): Potential vs Readiness Matrix
  prioritization: {
    potentialScore: number; // 1.0 to 5.0
    readinessScore: number; // 1.0 to 5.0
    quadrant: 'Shape a Pilot Now' | 'Name the Unlock' | 'Supporting Role' | 'Park It';
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

  source: 'gemini' | 'heuristic-fallback' | 'demo';
}

