import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, NoObjectGeneratedError, Output, jsonSchema, streamText } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./ai-run-id.server";
import { parseFeedback, type Feedback } from "./feedback";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const INSTRUCTIONS = `You are a friendly, encouraging English speaking coach for Indian learners.
The user spoke on a topic and their speech was converted to text (so ignore missing punctuation and capitalisation).
Return:
- corrected_text: the full corrected version of what they said, natural and simple English, keeping their meaning.
- mistakes: the important grammar, word-choice or sentence mistakes (max 6). For each: "wrong" (their exact words), "correct" (fixed version), and "explanation": one short, simple sentence in Hinglish (Hindi written in English letters), e.g. "Yahan past tense chahiye kyunki baat kal ki hai."
  If there are no real mistakes, return an empty list.
- tip: one short, friendly improvement tip in Hinglish.`;

const schema = jsonSchema<Feedback>({
  type: "object",
  additionalProperties: false,
  required: ["corrected_text", "mistakes", "tip"],
  properties: {
    corrected_text: { type: "string" },
    mistakes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["wrong", "correct", "explanation"],
        properties: {
          wrong: { type: "string" },
          correct: { type: "string" },
          explanation: { type: "string" },
        },
      },
    },
    tip: { type: "string" },
  },
});

export type FeedbackResult = { feedback: Feedback; error: null } | { feedback: null; error: string };

const FRIENDLY = "Sorry, the AI coach couldn't check this right now. Please try again in a moment.";

export async function generateFeedback(topic: string, transcript: string): Promise<FeedbackResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    console.error("[feedback] LOVABLE_API_KEY missing");
    return { feedback: null, error: FRIENDLY };
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions: INSTRUCTIONS,
      messages: [{ role: "user", content: `Topic: ${topic}\n\nWhat I said:\n${transcript}` }],
      output: Output.object({ schema }),
      maxRetries: 0,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const feedback = parseFeedback(await result.output);
    if (!feedback) return { feedback: null, error: FRIENDLY };
    return { feedback, error: null };
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      const fallback = (() => {
        try {
          return parseFeedback(JSON.parse(error.text ?? ""));
        } catch {
          return null;
        }
      })();
      if (fallback) return { feedback: fallback, error: null };
    }
    const status = APICallError.isInstance(error) ? error.statusCode : undefined;
    console.error("[feedback] AI call failed", status, error);
    if (status === 429) return { feedback: null, error: "The AI coach is busy right now. Please wait a minute and try again." };
    if (status === 402 || status === 403)
      return { feedback: null, error: "AI feedback is unavailable right now because the app's AI credits have run out." };
    return { feedback: null, error: FRIENDLY };
  }
}
