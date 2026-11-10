import type { AuditInsights, UserProfile } from "@/app/types/audit";
import { standardizeAuditReport } from "@/lib/report-standard";

export const DEMO_PROFILE: UserProfile = {
  name: "Demo", email: "", company: "Globe", industry: "Telecommunications", position: "Marketing Lead",
};

// Illustrative placements based on the supplied reference, not a live Globe audit.
const DEMO_REPORT: AuditInsights = {
  assetMatrix: [
    { name: "Name", potentialScore: 4.5, readinessScore: 2.1, nextStep: "Connect the brand name to one clear customer benefit." },
    { name: "Logo", potentialScore: 4.0, readinessScore: 1.5, nextStep: "Make the logo useful across everyday customer moments." },
    { name: "Rewards", potentialScore: 3.9, readinessScore: 2.5, nextStep: "Agree one owner for a simpler rewards experience." },
    { name: "Router", potentialScore: 3.3, readinessScore: 2.0, nextStep: "Add setup help where customers first use the router." },
    { name: "SMS", potentialScore: 4.6, readinessScore: 4.4, nextStep: "Test one helpful link in the load-confirmation message." },
    { name: "GlobeOne app", potentialScore: 4.2, readinessScore: 3.5, nextStep: "Give new subscribers one useful action after sign-in." },
    { name: "917 assets & merch", potentialScore: 3.9, readinessScore: 4.6, nextStep: "Link merchandise to a useful customer experience." },
    { name: "Branded content", potentialScore: 3.5, readinessScore: 3.6, nextStep: "Turn a common customer question into a short guide." },
    { name: "Instructions", potentialScore: 3.2, readinessScore: 4.7, nextStep: "Simplify the first three setup steps." },
    { name: "Globe Store", potentialScore: 2.0, readinessScore: 1.9, nextStep: "Confirm customer demand before changing this asset." },
    { name: "Social accounts", potentialScore: 2.4, readinessScore: 4.0, nextStep: "Use existing posts to support the SMS test." },
    { name: "Website", potentialScore: 2.1, readinessScore: 3.5, nextStep: "Keep a simple help page ready for SMS visitors." },
    { name: "Database", potentialScore: 2.0, readinessScore: 4.7, nextStep: "Check consent before selecting the test audience." },
    { name: "Globe shops", potentialScore: 1.6, readinessScore: 4.4, nextStep: "Use shop teams to gather feedback on the test." },
    { name: "Bills", potentialScore: 1.3, readinessScore: 3.8, nextStep: "Keep bills clear and support the same useful next step." },
  ],
  businessTension: {
    headline: "Make everyday messages more useful",
    summary: "Customers see service messages often. Use that moment to make their next step easier.",
    coreDifficulty: "Useful service moments are split across teams.",
    targetBehavior: "Help subscribers find and use their plan benefits.",
  },
  livedMoment: {
    touchpoint: "The SMS after a customer adds load",
    frequency: "After every top-up",
    currentPerception: "Transactional",
    desiredOutcome: "Check a useful plan benefit in one tap",
    attentionGap: "The message confirms payment but offers little help.",
  },
  assetFamilies: [
    { family: "Recognition", description: "Name, logo, and design", currentUtilization: 45, opportunityPotential: 75, isPrimaryCandidate: false },
    { family: "Data", description: "Service messages and customer signals", currentUtilization: 35, opportunityPotential: 90, isPrimaryCandidate: true },
    { family: "Story & Content", description: "Guides and branded content", currentUtilization: 40, opportunityPotential: 70, isPrimaryCandidate: false },
    { family: "Physical", description: "Routers, shops, and merchandise", currentUtilization: 30, opportunityPotential: 65, isPrimaryCandidate: false },
  ],
  familyInsight: "Start with SMS: frequent contact, one clear change, simple measurement.",
  prioritization: {
    potentialScore: 4.6, readinessScore: 4.4, quadrant: "Shape a Pilot Now",
    quadrantAction: "Test one helpful link in the top-up SMS.",
    potentialBreakdown: [
      { name: "Audience Contact", score: 5, notes: "Customers already read service messages" },
      { name: "Distinctiveness & Fit", score: 4, notes: "Help feels natural in this moment" },
      { name: "Audience Utility", score: 5, notes: "One tap to a useful benefit" },
    ],
    readinessBreakdown: [
      { name: "Access & Ownership", score: 4, notes: "Confirm one messaging owner" },
      { name: "Rights & Safeguards", score: 4, notes: "Check service-message rules and consent" },
      { name: "Delivery & Learning", score: 5, notes: "Compare link clicks and benefit use" },
    ],
  },
  pilotCard: {
    headline: "A more useful top-up SMS",
    oneAudience: "Prepaid subscribers who just added load",
    oneTouchpoint: "Top-up confirmation SMS",
    oneChange: "Add one link to a relevant plan benefit.",
    successSignal: "Compare benefit use with the original message.",
    accountableOwner: "CRM and customer experience",
    guardrail: "Keep the confirmation clear. Check consent.",
  },
  synthesis: {
    closingQuote: "Make a familiar moment useful.",
    strategicSummary: "Start with a message customers already receive.",
    quickWin: "Choose one SMS, one benefit, and one owner for the test.",
    fullAuditNote: "Review results before expanding the test.",
  },
  source: "demo",
};

export const DEMO_INSIGHTS = standardizeAuditReport(DEMO_REPORT, DEMO_REPORT);
