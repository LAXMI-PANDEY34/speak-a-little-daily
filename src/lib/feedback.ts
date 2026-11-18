// Client-safe shape of the AI coach feedback stored in sessions.feedback.
export interface Mistake {
  wrong: string;
  correct: string;
  explanation: string;
}

export interface Feedback {
  corrected_text: string;
  mistakes: Mistake[];
  tip: string;
}

/** Narrow unknown JSON (e.g. the jsonb column) to Feedback, or null. */
export function parseFeedback(value: unknown): Feedback | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<Record<keyof Feedback, unknown>>;
  if (typeof v.corrected_text !== "string" || typeof v.tip !== "string" || !Array.isArray(v.mistakes)) return null;
  const mistakes = v.mistakes.filter(
    (m): m is Mistake =>
      !!m &&
      typeof m === "object" &&
      typeof (m as Mistake).wrong === "string" &&
      typeof (m as Mistake).correct === "string" &&
      typeof (m as Mistake).explanation === "string",
  );
  return { corrected_text: v.corrected_text, mistakes, tip: v.tip };
}
