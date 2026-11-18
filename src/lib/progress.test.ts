import { describe, expect, it } from "vitest";
import { clampScore, parseFeedback } from "./feedback";
import { lastGrammarScores, totalMinutes } from "./progress";
import { TOPICS, TOPIC_LEVELS, randomTopic } from "./practice";

const fb = (score: number) => ({ corrected_text: "x", mistakes: [], tip: "t", score, fluency_score: 5 });

describe("topic chooser", () => {
  it("groups all 30 topics into Beginner, Intermediate and Advanced", () => {
    expect(TOPIC_LEVELS.map((g) => g.level)).toEqual(["Beginner", "Intermediate", "Advanced"]);
    const all = TOPIC_LEVELS.flatMap((g) => g.topics);
    expect(new Set(all).size).toBe(30);
    expect([...all].sort()).toEqual([...TOPICS].sort());
  });

  it("random topic never repeats the current one", () => {
    for (const r of [0, 0.5, 0.999]) expect(randomTopic(TOPICS[0], () => r)).not.toBe(TOPICS[0]);
  });
});

describe("scores", () => {
  it("keeps scores between 1 and 10", () => {
    expect(clampScore(0)).toBe(1);
    expect(clampScore(14)).toBe(10);
    expect(clampScore(7.4)).toBe(7);
    expect(clampScore("7")).toBeNull();
  });

  it("reads old feedback without scores", () => {
    expect(parseFeedback({ corrected_text: "a", mistakes: [], tip: "b" })?.score).toBeNull();
  });
});

describe("progress", () => {
  it("adds up minutes spoken", () => {
    expect(totalMinutes([{ created_at: "", duration_seconds: 90, feedback: null }, { created_at: "", duration_seconds: 30, feedback: null }])).toBe(2);
  });

  it("charts only the last 7 scored sessions, oldest first", () => {
    const sessions: { created_at: string; duration_seconds: number; feedback: unknown }[] = Array.from({ length: 9 }, (_, i) => ({
      created_at: `2026-11-${String(10 + i).padStart(2, "0")}T10:00:00Z`,
      duration_seconds: 60,
      feedback: fb(i + 1),
    }));
    sessions.push({ created_at: "2026-11-30T10:00:00Z", duration_seconds: 60, feedback: null });
    expect(lastGrammarScores(sessions).map((s) => s.score)).toEqual([3, 4, 5, 6, 7, 8, 9]);
  });
});
