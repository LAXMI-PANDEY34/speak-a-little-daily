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
  /** Grammar score 1-10. Missing on feedback saved before scores existed. */
  score?: number | null;
  score_reason?: string | null;
  /** Fluency score 1-10. */
  fluency_score?: number | null;
  fluency_reason?: string | null;
}

/** Round and clamp a score into 1..10, or null when it isn't a number. */
export function clampScore(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(10, Math.max(1, Math.round(value)));
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
  return {
    corrected_text: v.corrected_text,
    mistakes,
    tip: v.tip,
    score: clampScore(v.score),
    score_reason: typeof v.score_reason === "string" ? v.score_reason : null,
    fluency_score: clampScore(v.fluency_score),
    fluency_reason: typeof v.fluency_reason === "string" ? v.fluency_reason : null,
  };
}
