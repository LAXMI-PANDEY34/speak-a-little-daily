import { describe, expect, it } from "vitest";
import { TOPICS, computeStreak, topicForDate } from "./practice";

describe("daily topic", () => {
  it("has 30 built-in topics", () => {
    expect(TOPICS).toHaveLength(30);
  });

  it("keeps the same topic all day", () => {
    expect(topicForDate(new Date(2026, 10, 18, 0, 5))).toBe(topicForDate(new Date(2026, 10, 18, 23, 55)));
  });

  it("moves to the next topic the next day", () => {
    const i = TOPICS.indexOf(topicForDate(new Date(2026, 10, 18)) as (typeof TOPICS)[number]);
    expect(topicForDate(new Date(2026, 10, 19))).toBe(TOPICS[(i + 1) % 30]);
  });

  it("repeats after 30 days", () => {
    expect(topicForDate(new Date(2026, 10, 18))).toBe(topicForDate(new Date(2026, 11, 18)));
  });
});

describe("streak", () => {
  const today = new Date(2026, 10, 18, 12);

  it("counts consecutive days ending today", () => {
    const dates = [new Date(2026, 10, 18, 9), new Date(2026, 10, 17, 20), new Date(2026, 10, 16, 8)];
    expect(computeStreak(dates, today)).toBe(3);
  });

  it("counts several sessions on one day once", () => {
    expect(computeStreak([new Date(2026, 10, 18, 9), new Date(2026, 10, 18, 10)], today)).toBe(1);
  });

  it("keeps yesterday's streak when you haven't practiced today yet", () => {
    expect(computeStreak([new Date(2026, 10, 17), new Date(2026, 10, 16)], today)).toBe(2);
  });

  it("resets when a day is missed", () => {
    expect(computeStreak([new Date(2026, 10, 15)], today)).toBe(0);
  });

  it("stops at a gap", () => {
    const dates = [new Date(2026, 10, 18), new Date(2026, 10, 17), new Date(2026, 10, 14)];
    expect(computeStreak(dates, today)).toBe(2);
  });
});
