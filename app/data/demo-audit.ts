import type { AuditInsights, UserProfile, UserResponses } from "@/app/types/audit";
import { standardizeAuditReport } from "@/lib/report-standard";

export const DEMO_PROFILE: UserProfile = {
  name: "Demo", email: "", company: "Globe", industry: "Telecommunications", position: "Marketing Lead",
};

// A fictional brief for demonstrating the three-question flow, not Globe findings.
export const DEMO_RESPONSES: UserResponses = {
  q1: "Prepaid subscribers top up regularly but often miss benefits included in their plan. We want them to discover and use those benefits, rather than only checking their balance.",
  q2: "We own our name and logo, SMS confirmations, the GlobeOne app, rewards, customer database, website, branded content, instructions, routers, 917 merchandise, social accounts, bills, Globe Store and Globe shops. SMS mainly confirms transactions; content explains services; shops and routers support setup. In this example, the CRM messaging team can edit SMS and compare responses, while a service-link review is required before a test. Changes to rewards, routers and database use need other teams' approval.",
  q3: "Immediately after topping up, subscribers receive an SMS while already using their phone. We want that message to help them find and use one relevant plan benefit in a single tap. The confirmation should remain clear and useful.",
};

// All scores and placements below are illustrative working assessments.
// Explicit placement expresses priority against benefit discovery, not a universal cutoff.
const DEMO_REPORT: AuditInsights = {
  assetMatrix: [
    { name: "SMS", potentialScore: 4.7, readinessScore: 3.7, placement: "pilot", nextStep: "Test one benefit link in the top-up confirmation.", answerRefs: ["q1", "q2", "q3"] },
    { name: "GlobeOne app", potentialScore: 4.4, readinessScore: 3.2, placement: "pilot", nextStep: "Land SMS visitors directly on the relevant benefit.", answerRefs: ["q2", "q3"] },
    { name: "Website", potentialScore: 3.7, readinessScore: 4.0, placement: "pilot", nextStep: "Give the benefit link one clear destination.", answerRefs: ["q2", "q3"] },
    { name: "Branded content", potentialScore: 3.8, readinessScore: 3.6, placement: "pilot", nextStep: "Explain one benefit in a short, practical guide.", answerRefs: ["q2", "q3"] },
    { name: "Instructions", potentialScore: 3.6, readinessScore: 4.0, placement: "pilot", nextStep: "Show the few steps needed to use that benefit.", answerRefs: ["q2", "q3"] },
    { name: "Rewards", potentialScore: 4.3, readinessScore: 2.3, placement: "unlock", nextStep: "Confirm eligibility and ownership before linking to a reward.", answerRefs: ["q1", "q2"] },
    { name: "Database", potentialScore: 4.0, readinessScore: 2.0, placement: "unlock", nextStep: "Confirm permitted data use before personalizing the message.", answerRefs: ["q2", "q3"] },
    { name: "Router", potentialScore: 3.4, readinessScore: 2.4, placement: "unlock", nextStep: "Agree a setup moment and owner before testing prompts.", answerRefs: ["q2"] },
    { name: "Logo", potentialScore: 2.5, readinessScore: 4.2, placement: "support", nextStep: "Keep the benefit message recognizably from Globe.", answerRefs: ["q2", "q3"] },
    { name: "917 assets & merch", potentialScore: 2.1, readinessScore: 4.2, placement: "support", nextStep: "Support recognition; keep the first test focused on SMS.", answerRefs: ["q2"] },
    { name: "Social accounts", potentialScore: 2.4, readinessScore: 4.1, placement: "support", nextStep: "Reuse the benefit guide to answer subscriber questions.", answerRefs: ["q2", "q3"] },
    { name: "Globe shops", potentialScore: 2.5, readinessScore: 3.5, placement: "support", nextStep: "Gather questions that could improve the benefit guide.", answerRefs: ["q2", "q3"] },
    { name: "Bills", potentialScore: 2.2, readinessScore: 3.8, placement: "support", nextStep: "Keep payment information clear while the SMS test runs.", answerRefs: ["q2"] },
    { name: "Name", potentialScore: 2.3, readinessScore: 2.1, placement: "monitor", nextStep: "Defer naming changes; they do not resolve benefit discovery.", answerRefs: ["q1", "q2"] },
    { name: "Globe Store", potentialScore: 1.8, readinessScore: 1.8, placement: "monitor", nextStep: "Revisit after learning whether the SMS approach helps.", answerRefs: ["q1", "q2"] },
  ],
  businessTension: {
    headline: "Customers top up, but miss benefits",
    summary: "Subscribers top up regularly but miss benefits already in their plan; the confirmation SMS gives them no clear next step.",
    coreDifficulty: "Top-up confirmations close the transaction without a clear next step.",
    targetBehavior: "Open and use one relevant benefit after topping up.",
    audience: "Prepaid subscribers who have just topped up",
    opportunityHypothesis: "A single benefit link in the existing top-up SMS could turn payment confirmation into a useful action without adding another channel.",
    openQuestions: [
      "Which benefit offers the clearest value after a top-up?",
      "Can benefit use be measured without collecting additional personal data?",
    ],
    answerRefs: ["q1", "q3"],
  },
  livedMoment: {
    touchpoint: "Top-up confirmation SMS",
    frequency: "After each top-up",
    currentPerception: "Transactional",
    desiredOutcome: "Find and use a plan benefit in one tap",
    attentionGap: "The confirmation reports a payment but gives no useful next step.",
  },
  assetFamilies: [
    {
      family: "Recognition",
      currentUse: "Name and logo identify Globe across existing touchpoints.",
      description: "Familiar branding already identifies the sender, so a consistent benefit cue could make the new action easier to recognize.",
      currentUtilization: null, opportunityPotential: null, isPrimaryCandidate: false,
      answerRefs: ["q2", "q3"],
    },
    {
      family: "Data",
      currentUse: "SMS confirms transactions; the database supports customer information.",
      description: "Top-up texts already confirm a payment, so one relevant benefit link could help subscribers act on that existing service moment.",
      currentUtilization: null, opportunityPotential: null, isPrimaryCandidate: true,
      answerRefs: ["q1", "q2", "q3"],
    },
    {
      family: "Story & Content",
      currentUse: "Branded content and instructions explain services and setup.",
      description: "Existing explanations could become a short benefit guide, giving the SMS link a clear destination that helps subscribers complete one useful action.",
      currentUtilization: null, opportunityPotential: null, isPrimaryCandidate: false,
      answerRefs: ["q2", "q3"],
    },
    {
      family: "Physical",
      currentUse: "Routers, shops, bills and merchandise support everyday service interactions.",
      description: "Shops and routers already support setup, so simple benefit prompts could extend the same journey after the SMS test produces learning.",
      currentUtilization: null, opportunityPotential: null, isPrimaryCandidate: false,
      answerRefs: ["q2", "q3"],
    },
  ],
  familyInsight: "Start with SMS: an existing contact and one useful next step.",
  prioritization: {
    potentialScore: 4.7, readinessScore: 3.7, quadrant: "Shape a Pilot Now",
    quadrantAction: "Prepare the SMS test; resolve the service-link review before launch.",
    openQuestions: [
      "Approve message wording and any required consent checks.",
      "Verify benefit-use tracking before sending test messages.",
    ],
    potentialBreakdown: [
      { name: "Audience Contact", score: 5, notes: "Existing contact immediately after top-up", answerRefs: ["q3"] },
      { name: "Distinctiveness & Fit", score: 4, notes: "Useful guidance fits a service message", answerRefs: ["q1", "q3"] },
      { name: "Audience Utility", score: 5, notes: "One tap to a relevant benefit", answerRefs: ["q1", "q3"] },
    ],
    readinessBreakdown: [
      { name: "Access & Ownership", score: 4, notes: "The CRM messaging team can edit SMS, giving the proposed test an existing route to delivery.", answerRefs: ["q2"] },
      { name: "Rights & Safeguards", score: 3, notes: "The required service-link review must be completed before the SMS test can launch.", answerRefs: ["q2"] },
      { name: "Delivery & Learning", score: 4, notes: "The team can compare SMS responses, but tracking actual benefit use still needs confirmation.", answerRefs: ["q2", "q3"] },
    ],
  },
  pilotCard: {
    headline: "One useful next step after top-up",
    oneAudience: "Prepaid subscribers who have just topped up",
    oneTouchpoint: "Top-up confirmation SMS",
    oneChange: "Add one link to a relevant plan benefit.",
    successSignal: "Compare benefit use against an unchanged confirmation SMS.",
    accountableOwner: "CRM messaging team",
    guardrail: "Approve consent, wording and delivery before the test.",
  },
  synthesis: {
    closingQuote: "Make an existing service moment useful.",
    strategicSummary: "Test a useful action where subscribers already receive confirmation.",
    quickWin: "Review one SMS and draft a single benefit link.",
    fullAuditNote: "Use the comparison to decide whether to scale, refine or stop.",
  },
  source: "demo",
};

export const DEMO_INSIGHTS = standardizeAuditReport(DEMO_REPORT, DEMO_REPORT);
