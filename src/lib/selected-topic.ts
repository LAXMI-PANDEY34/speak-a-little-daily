import { useCallback, useState } from "react";
import { dayKey, isTopic, topicForDate } from "./practice";

// The user's chosen topic for today, kept in this browser until the day ends.
function storageKey() {
  return `dsp-topic:${dayKey(new Date())}`;
}

function readChosen(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(storageKey());
    return isTopic(v) ? v : null;
  } catch {
    return null;
  }
}

/** Topic to practice: the one chosen today, otherwise today's rotating topic. */
export function useActiveTopic() {
  const [chosen, setChosen] = useState<string | null>(readChosen);
  const topic = chosen ?? topicForDate(new Date());

  const choose = useCallback((t: string) => {
    try {
      window.localStorage.setItem(storageKey(), t);
    } catch {
      /* storage unavailable: keep in memory */
    }
    setChosen(t);
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey());
    } catch {
      /* ignore */
    }
    setChosen(null);
  }, []);

  return { topic, isCustom: chosen !== null && chosen !== topicForDate(new Date()), choose, reset };
}
