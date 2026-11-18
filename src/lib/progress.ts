import { parseFeedback } from "./feedback";

export interface SessionLike {
  created_at: string;
  duration_seconds: number;
  feedback: unknown;
}

export function totalMinutes(sessions: SessionLike[]): number {
  const secs = sessions.reduce((sum, s) => sum + Math.max(0, s.duration_seconds), 0);
  return Math.round((secs / 60) * 10) / 10;
}

/** Grammar scores of the last 7 scored sessions, oldest first (for the chart). */
export function lastGrammarScores(sessions: SessionLike[], count = 7) {
  return sessions
    .map((s) => ({ created_at: s.created_at, score: parseFeedback(s.feedback)?.score ?? null }))
    .filter((s): s is { created_at: string; score: number } => s.score !== null)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(-count);
}
