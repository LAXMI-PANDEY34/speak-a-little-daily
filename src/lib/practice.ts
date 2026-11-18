export const TOPICS = [
  "Introduce yourself",
  "Describe your daily routine",
  "Talk about your favorite food",
  "Describe your hometown",
  "Talk about your best friend",
  "Describe your dream job",
  "Talk about a hobby you enjoy",
  "Describe your favorite place to relax",
  "Talk about a movie you like",
  "Describe your family",
  "Talk about your last weekend",
  "Describe your favorite season",
  "Talk about a book you have read",
  "Describe your house or flat",
  "Talk about a trip you remember",
  "Describe your morning",
  "Talk about your favorite festival",
  "Describe a teacher who inspired you",
  "Talk about the weather today",
  "Describe your favorite app",
  "Talk about a skill you want to learn",
  "Describe your perfect day",
  "Talk about a goal for this year",
  "Describe your favorite animal",
  "Talk about music you listen to",
  "Describe a meal you cooked",
  "Talk about your work or studies",
  "Describe a happy memory",
  "Talk about how you stay healthy",
  "Describe what you did yesterday",
] as const;

export type TopicLevel = "Beginner" | "Intermediate" | "Advanced";

/** The same 30 topics, grouped by level for the topic chooser. */
export const TOPIC_LEVELS: { level: TopicLevel; topics: (typeof TOPICS)[number][] }[] = [
  {
    level: "Beginner",
    topics: [
      "Introduce yourself",
      "Describe your daily routine",
      "Talk about your favorite food",
      "Describe your family",
      "Describe your favorite season",
      "Describe your house or flat",
      "Talk about the weather today",
      "Describe your favorite animal",
      "Describe your morning",
      "Describe what you did yesterday",
    ],
  },
  {
    level: "Intermediate",
    topics: [
      "Describe your hometown",
      "Talk about your best friend",
      "Talk about a hobby you enjoy",
      "Describe your favorite place to relax",
      "Talk about a movie you like",
      "Talk about your last weekend",
      "Talk about music you listen to",
      "Describe a meal you cooked",
      "Describe your favorite app",
      "Talk about your favorite festival",
    ],
  },
  {
    level: "Advanced",
    topics: [
      "Describe your dream job",
      "Talk about a book you have read",
      "Talk about a trip you remember",
      "Describe a teacher who inspired you",
      "Talk about a skill you want to learn",
      "Describe your perfect day",
      "Talk about a goal for this year",
      "Talk about your work or studies",
      "Describe a happy memory",
      "Talk about how you stay healthy",
    ],
  },
];

export function isTopic(value: unknown): value is (typeof TOPICS)[number] {
  return typeof value === "string" && (TOPICS as readonly string[]).includes(value);
}

/** A random topic from the list, different from `current` when possible. */
export function randomTopic(current: string, rand: () => number = Math.random): string {
  const pool = TOPICS.filter((t) => t !== current);
  return pool[Math.floor(rand() * pool.length)] ?? TOPICS[0];
}

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/** Same topic all day; the next topic in the list each new day, cycling through all 30. */
export function topicForDate(date: Date): string {
  const n = dayNumber(date);
  return TOPICS[((n % TOPICS.length) + TOPICS.length) % TOPICS.length] ?? TOPICS[0];
}

/**
 * Consecutive days practiced, ending today. If there is no session today yet,
 * the streak still counts from yesterday so it isn't lost before you practice.
 */
export function computeStreak(sessionDates: Date[], today: Date = new Date()): number {
  const days = new Set(sessionDates.map(dayKey));
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
