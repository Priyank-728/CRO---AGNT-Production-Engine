import { GoogleGenAI, Type, Schema } from "@google/genai";
import {
  LandingPageInput,
  LandingPageBlueprint,
  PageSection,
  Feedback
} from "../types";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error("Missing VITE_GEMINI_API_KEY");
}
/* ============================
   SCHEMA DEFINITIONS
   ============================ */

const contentSchemaProperties = {
  headline: { type: Type.STRING, description: "Concise headline" },
  description: { type: Type.STRING, description: "1-2 sentences explaining value" },
  bullets: {
    type: Type.ARRAY,
    items: { type: Type.STRING }
  },
  cta: { type: Type.STRING, description: "Short Call to Action" },
  // Simplified description to prevent model from "checking" itself in the output
  ribbon: { type: Type.STRING, description: "Short badge text. Example: 'Best Seller'" },
  image: {
    type: Type.OBJECT,
    properties: {
      purpose: { type: Type.STRING },
      description: { type: Type.STRING }
    },
    required: ["purpose", "description"]
  }
};

// Blueprint schema (FULL PAGE)
const blueprintSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    primaryIntent: { type: Type.STRING },
    designHints: {
      type: Type.OBJECT,
      properties: {
        visualStyle: { type: Type.STRING },
        contrastLevel: {
          type: Type.STRING,
          enum: ["high", "medium", "low"]
        },
        spacing: {
          type: Type.STRING,
          enum: ["compact", "generous"]
        },
        trustEmphasis: {
          type: Type.STRING,
          enum: ["subtle", "high"]
        }
      },
      required: ["visualStyle", "contrastLevel", "spacing", "trustEmphasis"]
    },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING },
          layout: {
            type: Type.STRING,
            enum: [
              "centered",
              "two-column",
              "grid",
              "feature-left",
              "feature-right"
            ]
          },
          content: {
            type: Type.OBJECT,
            properties: contentSchemaProperties,
            // 🔒 HARD REQUIREMENT
            required: ["headline", "description"]
          }
        },
        required: ["id", "type", "layout", "content"]
      }
    }
  },
  required: ["primaryIntent", "designHints", "sections"]
};

// Single section schema (REGENERATION)
const sectionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    type: { type: Type.STRING },
    layout: {
      type: Type.STRING,
      enum: [
        "centered",
        "two-column",
        "grid",
        "feature-left",
        "feature-right"
      ]
    },
    content: {
      type: Type.OBJECT,
      properties: contentSchemaProperties,
      // 🔒 HARD REQUIREMENT
      required: ["headline", "description"]
    }
  },
  required: ["id", "type", "layout", "content"]
};

/* ============================
   JSON PARSER (UNCHANGED)
   ============================ */

const cleanAndParseJSON = (text: string) => {
  if (!text) throw new Error("Empty response from AI");

  const sanitize = (str: string) =>
    str.replace(/,(\s*[}\]])/g, "$1");

  const tryParse = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  let parsed = tryParse(text) || tryParse(sanitize(text));
  if (parsed) return parsed;

  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    parsed = tryParse(match[1]) || tryParse(sanitize(match[1]));
    if (parsed) return parsed;
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    const slice = text.slice(start, end + 1);
    parsed = tryParse(slice) || tryParse(sanitize(slice));
    if (parsed) return parsed;
  }

  console.error("Unparseable AI output:", text);
  throw new Error("Invalid JSON returned by model");
};

/* ============================
   GENERATE LANDING PAGE
   ============================ */

export const generateLandingPage = async (
  input: LandingPageInput
): Promise<LandingPageBlueprint> => {
  const systemInstruction = `
ROLE: Senior CRO & Landing Page Architect.

OBJECTIVE:
Generate a high-converting landing page structure in strict JSON format.

RULES:
1. Output RAW JSON ONLY. No markdown blocks, no commentary.
2. Sections Order: Hero -> SocialProof -> ValueProps -> Offer -> Guarantee -> Footer.
3. Copy: Persuasive, direct, and benefit-oriented.
4. Constraints:
   - Headlines: Concise (under 12 words).
   - Descriptions: 1-2 sentences.
   - Ribbon: Short badge text only (e.g. "Best Seller"). DO NOT include validation text.
   - Images: Visual descriptions required for key sections.

NEGATIVE CONSTRAINTS:
- Do NOT generate internal monologue or self-correction text.
- Do NOT repeat phrases.
- Do NOT make up "subheadline" fields.
`;

  const userPrompt = `
Generate landing page blueprint.
Context:
- Product: ${input.productDetails}
- Ad Copy: ${input.adCopy}
- Audience: ${input.audienceAttributes}
- Goal: ${input.campaignObjective}
- Design: Dark Mode
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: blueprintSchema,
      temperature: 0.0, // Zero temperature for maximum determinism
      topP: 0.7, 
      maxOutputTokens: 4096 
    }
  });

  return cleanAndParseJSON(response.text || "{}");
};

/* ============================
   REGENERATE SECTION
   ============================ */

export const regenerateSection = async (
  currentSection: PageSection,
  feedback: Feedback,
  context: LandingPageInput
): Promise<PageSection> => {
  const systemInstruction = `
ROLE: Senior CRO Copywriter.

TASK: Rewrite the provided section based on feedback.

RULES:
- Return valid JSON matching the section schema.
- Maintain existing fields (description, image, etc).
- Apply the feedback strictly.
- No conversational text.
`;

  const userPrompt = `
SECTION TO EDIT:
${JSON.stringify(currentSection, null, 2)}

FEEDBACK:
${feedback.comment}

OUTPUT:
Updated JSON object for this section.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: sectionSchema,
      temperature: 0.0,
      topP: 0.7,
      maxOutputTokens: 2048
    }
  });

  const updated = cleanAndParseJSON(response.text || "{}");
  return { ...updated, id: currentSection.id, isLocked: false };
};
