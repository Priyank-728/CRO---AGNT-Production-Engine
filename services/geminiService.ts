import { GoogleGenAI, Type, Schema } from "@google/genai";
import {
  LandingPageInput,
  LandingPageBlueprint,
  PageSection,
  Feedback
} from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing VITE_GEMINI_API_KEY");
}

const ai = new GoogleGenAI({ apiKey });

/* ============================
   SCHEMA DEFINITIONS (LOCAL)
   ============================ */
/* NOTE:
   Schemas are intentionally NOT enforced at generation time.
   They exist for:
   - developer clarity
   - downstream validation
   - regeneration consistency
*/

const contentSchemaProperties = {
  headline: { type: Type.STRING },
  description: { type: Type.STRING },
  bullets: {
    type: Type.ARRAY,
    items: { type: Type.STRING }
  },
  cta: { type: Type.STRING },
  ribbon: { type: Type.STRING },
  image: {
    type: Type.OBJECT,
    properties: {
      purpose: { type: Type.STRING },
      description: { type: Type.STRING }
    },
    required: ["purpose", "description"]
  }
};

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
            required: ["headline", "description"]
          }
        },
        required: ["id", "type", "layout", "content"]
      }
    }
  },
  required: ["primaryIntent", "designHints", "sections"]
};

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
Generate a high-converting landing page in strict JSON.

RULES:
- Output RAW JSON only.
- Section order: Hero → SocialProof → ValueProps → Offer → Guarantee → Footer.
- No subheadlines.
- Headlines under 12 words.
- Descriptions 1–2 sentences.
- No repetition.
- No internal monologue.
`;

  const userPrompt = `
Generate landing page blueprint.

Product:
${input.productDetails}

Ad Copy:
${input.adCopy}

Audience:
${input.audienceAttributes}

Goal:
${input.campaignObjective}

Design:
Dark mode, premium, high contrast.
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

TASK:
Rewrite the section based on feedback.

RULES:
- Output JSON only.
- Preserve structure.
- Improve clarity and conversion.
- No repetition.
`;

  const userPrompt = `
CURRENT SECTION:
${JSON.stringify(currentSection, null, 2)}

FEEDBACK:
${feedback.comment}
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
