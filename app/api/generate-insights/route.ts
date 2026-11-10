import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AuditInsights, UserProfile, UserResponses } from "@/app/types/audit";
import { createFallbackMatrix } from "@/lib/audit-matrix";
import { standardizeAuditReport } from "@/lib/report-standard";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name = "Brand Leader",
      email = "leader@company.com",
      company = "Your Brand",
      industry = "Enterprise",
      position = "",
      q1 = "",
      q2 = "",
      q3 = "",
      ownedMediaThought = "Untapped opportunity across touchpoints",
    }: UserProfile & UserResponses = body;

    const fallback = generateHeuristicInsights({ name, email, company, industry, position, q1, q2, q3, ownedMediaThought });

    const apiKey = process.env.GEMINI_API_KEY;
    const preferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const modelsToTry = [
      preferredModel,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ].filter((v, i, a) => a.indexOf(v) === i);

    if (apiKey && apiKey.trim() !== "" && apiKey !== "your_gemini_api_key_here") {
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `
You are an owned media auditor applying "A Lightweight Owned-assets Audit".
Find useful opportunities in the assets this brand already owns. The report leads with charts and a small test plan.

WRITING RULES:
- Use simple, everyday words. No marketing jargon, slogans, quotes, or long explanations.
- headline: 3–6 words. summary: one sentence, at most 20 words.
- All other text fields: one short phrase, at most 12 words. Dimension notes: at most 6 words.
- Do not repeat the same idea across fields or explain the methodology.
- Ground the advice in the answers, including the optional owned-media thoughts.
- Scores are directional estimates, not measured results. Do not invent proof, consent, or performance guarantees.
- assetMatrix: score each distinct owned asset mentioned in the answers separately, with a short name and one next step.
- Include 1–16 assets. Do not invent assets to fill quadrants. Use the full 1–5 range for both scores.
- Score potential and readiness independently. Scores of 3.0 or more are high; scores below 3.0 are low.
- Always use the same four asset families in this order: Recognition, Data, Story & Content, Physical.
- Mark exactly one family as the primary candidate. Include exactly three dimensions for each score, using the schema's names.
- The pilot must focus on one asset from assetMatrix. Its summary scores must match that asset's scores.
- Keep the report structure identical for every client. Personalize the assets, diagnosis, desired outcome, scores, and test plan.

CORE AUDIT PRINCIPLES:
1. "Your next media opportunity may already be in your footprint. Before adding more channels, inspect the assets audiences already encounter—and ask what useful job they could do next."
2. "The opportunity is in the gap between an asset being present and an asset being noticed, useful or distinctive."
3. The 4 Owned-Asset Families:
   - Recognition: name, logo, design, tagline, color, mascots/characters (cues audiences repeatedly see but may not notice/remember)
   - Data: CRM, sales, user and first-party signals (signals permitted to use to make experiences more relevant)
   - Story & content: brand history, people, films, social content (stories, expertise or proof that earn attention)
   - Physical/Operational: packaging, storefront screens, warehouses, transport, contracts, receipts, customer portals (routine touchpoints that could become more useful/expressive)
4. Separate Opportunity (Potential) from Feasibility (Readiness):
   - Potential (1-5): Audience contact, Distinctiveness and fit, Audience utility
   - Readiness (1-5): Access and ownership, Rights and safeguards, Delivery and learning
   - Prioritization:
     * Use 3.0 as the boundary: a score of 3.0 or more is high.
     * High Potential + High Readiness = "Shape a Pilot Now"
     * High Potential + Low Readiness = "Name the Unlock"
     * Low Potential + High Readiness = "Supporting Role"
     * Low Potential + Low Readiness = "Park It"
5. The Smallest Credible Pilot:
   - One audience × One touchpoint × One change
   - Baseline → change one thing → observe signal → decide: scale, refine or stop.

INPUT CONTEXT:
- Brand/Company: ${company}
- Industry: ${industry}
- Stakeholder: ${name} (${email})
- Position: ${position || "Not provided"}
- Challenge (Q1 - Business Tension): ${q1}
- Owned Asset (Q2 - Owned Media in footprint): ${q2}
- Lived Moment (Q3 - When/where audience meets asset & desired utility): ${q3}
- Stakeholder perception of owned media: ${ownedMediaThought}

Return a JSON object that strictly follows this schema and the writing rules above:
{
  "assetMatrix": [
    {
      "name": "One specific asset from the answers, at most 5 words",
      "potentialScore": number (1.0 to 5.0),
      "readinessScore": number (1.0 to 5.0),
      "nextStep": "One simple next step for this asset, at most 12 words"
    }
  ],
  "businessTension": {
    "headline": "Short bold diagnosis (3-6 words)",
    "summary": "One plain sentence about the challenge, at most 20 words",
    "coreDifficulty": "What makes this tension stubborn to solve with standard paid channels",
    "targetBehavior": "The specific behavioral shift needed from the audience"
  },
  "livedMoment": {
    "touchpoint": "Specific encounter point from their response",
    "frequency": "Frequency context (e.g. Every transaction, Daily portal visit, Monthly statement)",
    "currentPerception": "Ignored" | "Transactional" | "Friction" | "Under-measured",
    "desiredOutcome": "What the audience should feel, do, or understand in that exact moment",
    "attentionGap": "The gap between being present and being distinctive or useful"
  },
  "assetFamilies": [
    {
      "family": "Recognition",
      "description": "Specific cue or visual anchor for this brand",
      "currentUtilization": number (10 to 90),
      "opportunityPotential": number (40 to 95),
      "isPrimaryCandidate": boolean
    },
    {
      "family": "Data",
      "description": "1st-party signal or behavioral trigger available",
      "currentUtilization": number (10 to 90),
      "opportunityPotential": number (40 to 95),
      "isPrimaryCandidate": boolean
    },
    {
      "family": "Story & Content",
      "description": "Brand proof, expertise, or narrative asset",
      "currentUtilization": number (10 to 90),
      "opportunityPotential": number (40 to 95),
      "isPrimaryCandidate": boolean
    },
    {
      "family": "Physical",
      "description": "Physical, digital product, or operational touchpoint",
      "currentUtilization": number (10 to 90),
      "opportunityPotential": number (40 to 95),
      "isPrimaryCandidate": boolean
    }
  ],
  "familyInsight": "One short sentence naming the best place to start",
  "prioritization": {
    "potentialScore": number (1.0 to 5.0, 1 decimal place),
    "readinessScore": number (1.0 to 5.0, 1 decimal place),
    "quadrant": "Shape a Pilot Now" | "Name the Unlock" | "Supporting Role" | "Park It",
    "quadrantAction": "Direct actionable directive based on the quadrant",
    "potentialBreakdown": [
      { "name": "Audience Contact", "score": number (1-5), "notes": "Short note" },
      { "name": "Distinctiveness & Fit", "score": number (1-5), "notes": "Short note" },
      { "name": "Audience Utility", "score": number (1-5), "notes": "Short note" }
    ],
    "readinessBreakdown": [
      { "name": "Access & Ownership", "score": number (1-5), "notes": "Short note" },
      { "name": "Rights & Safeguards", "score": number (1-5), "notes": "Short note" },
      { "name": "Delivery & Learning", "score": number (1-5), "notes": "Short note" }
    ]
  },
  "pilotCard": {
    "headline": "Bold title for smallest credible pilot",
    "oneAudience": "Specific subset of audience (e.g. High-intent repeat buyers)",
    "oneTouchpoint": "Single exact touchpoint (e.g. Order confirmation SMS, unboxing insert)",
    "oneChange": "One focused tweak that adds immediate utility or distinctiveness",
    "successSignal": "Behavior to measure during the test; do not promise an improvement",
    "accountableOwner": "Team accountable (e.g. CRM & Product Ops)",
    "guardrail": "Key permission or operational check (e.g. Privacy consent verified)"
  },
  "synthesis": {
    "closingQuote": "A short takeaway, at most 8 words",
    "strategicSummary": "One short sentence about the opportunity",
    "quickWin": "Immediate 7-day action step",
    "fullAuditNote": "A short suggestion for further review, without promising contact"
  }
}
Return ONLY valid JSON.
`;

      for (const candidateModel of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: candidateModel,
            contents: systemPrompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          });

          const text = response.text?.trim() || "";
          if (text) {
            const parsed = JSON.parse(text);
            return NextResponse.json({
              ...standardizeAuditReport(parsed, fallback),
              source: "gemini",
            } as AuditInsights);
          }
        } catch (attemptErr) {
          console.warn(`Gemini generation with ${candidateModel} failed:`, attemptErr);
        }
      }
    }

    // Heuristic fallback if Gemini API is not configured or throws error
    return NextResponse.json(standardizeAuditReport(fallback, fallback));
  } catch (error) {
    console.error("API error in generate-insights:", error);
    return NextResponse.json(
      { error: "Failed to generate audit insights" },
      { status: 500 }
    );
  }
}

function generateHeuristicInsights(data: UserProfile & UserResponses): AuditInsights {
  const company = data.company || "Your Brand";
  const industry = data.industry || "General Industry";
  const q1 = data.q1 || "Help customers take the next step.";
  const q2 = data.q2 || "Customer emails and notifications";
  const q3 = data.q3 || "Help customers feel confident after a purchase.";
  const needsOwner = data.ownedMediaThought?.toLowerCase().includes("split across teams");
  const excerpt = (text: string, limit: number) => {
    const words = text.trim().split(/\s+/);
    return words.length > limit ? `${words.slice(0, limit).join(" ")}…` : text.trim();
  };

  // Classify primary asset family based on Q2 text
  const q2Lower = q2.toLowerCase();
  let primaryFamily: "Recognition" | "Data" | "Story & Content" | "Physical" = "Physical";
  if (q2Lower.includes("data") || q2Lower.includes("crm") || q2Lower.includes("email") || q2Lower.includes("history")) {
    primaryFamily = "Data";
  } else if (q2Lower.includes("story") || q2Lower.includes("video") || q2Lower.includes("content") || q2Lower.includes("blog")) {
    primaryFamily = "Story & Content";
  } else if (q2Lower.includes("logo") || q2Lower.includes("brand") || q2Lower.includes("name") || q2Lower.includes("design")) {
    primaryFamily = "Recognition";
  }

  const insights: AuditInsights = {
    assetMatrix: [],
    businessTension: {
      headline: "Make your existing assets work harder",
      summary: excerpt(q1, 20),
      coreDifficulty: "More ads may miss what happens after the first contact.",
      targetBehavior: "Help customers take a useful next step.",
    },
    livedMoment: {
      touchpoint: excerpt(q2, 10),
      frequency: "Confirm with your team",
      currentPerception: "Transactional",
      desiredOutcome: excerpt(q3, 16),
      attentionGap: "Give this moment a clear next step.",
    },
    assetFamilies: [
      {
        family: "Recognition",
        description: `${company} design and voice`,
        currentUtilization: 42,
        opportunityPotential: 78,
        isPrimaryCandidate: primaryFamily === "Recognition",
      },
      {
        family: "Data",
        description: "Customer data and signals",
        currentUtilization: 35,
        opportunityPotential: 88,
        isPrimaryCandidate: primaryFamily === "Data",
      },
      {
        family: "Story & Content",
        description: "People, expertise, and stories",
        currentUtilization: 28,
        opportunityPotential: 82,
        isPrimaryCandidate: primaryFamily === "Story & Content",
      },
      {
        family: "Physical",
        description: "Packaging, receipts, screens, and portals",
        currentUtilization: 48,
        opportunityPotential: 92,
        isPrimaryCandidate: primaryFamily === "Physical",
      },
    ],
    familyInsight: `Start with ${primaryFamily.toLowerCase()} assets your audience already encounters.`,
    prioritization: {
      potentialScore: 4.4,
      readinessScore: needsOwner ? 2.8 : 4.1,
      quadrant: needsOwner ? "Name the Unlock" : "Shape a Pilot Now",
      quadrantAction: needsOwner ? "Agree one owner, then run a small test." : "Run one small test before investing more.",
      potentialBreakdown: [
        { name: "Audience Contact", score: 5, notes: "Check how often customers see it" },
        { name: "Distinctiveness & Fit", score: 4, notes: "Build on familiar brand cues" },
        { name: "Audience Utility", score: 4, notes: "Help at the right moment" },
      ],
      readinessBreakdown: [
        { name: "Access & Ownership", score: needsOwner ? 2 : 4, notes: "Confirm one owner" },
        { name: "Rights & Safeguards", score: needsOwner ? 3 : 4, notes: "Check consent and permissions" },
        { name: "Delivery & Learning", score: needsOwner ? 3 : 4, notes: "Pick one signal to track" },
      ],
    },
    pilotCard: {
      headline: "One small test",
      oneAudience: `${industry} customers`,
      oneTouchpoint: excerpt(q2, 10),
      oneChange: "Add one helpful next step.",
      successSignal: "Compare next-step clicks before and after the change.",
      accountableOwner: needsOwner ? "Agree one owner across teams" : "The team that owns this touchpoint",
      guardrail: "Keep the main task clear. Check consent.",
    },
    synthesis: {
      closingQuote: "Make the next step useful.",
      strategicSummary: "Give an existing touchpoint a more useful role.",
      quickWin: needsOwner ? "Choose one owner and review this touchpoint together." : "Review this touchpoint and choose one helpful change to test.",
      fullAuditNote: "Review the test results with your team.",
    },
    source: "heuristic-fallback",
  };
  insights.assetMatrix = createFallbackMatrix(q2, insights.prioritization);
  return insights;
}
