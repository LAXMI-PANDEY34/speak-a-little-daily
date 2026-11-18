import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, RotateCcw, Save, Sparkles, Square } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { formatDuration, topicForDate } from "@/lib/practice";
import { sessionsQuery } from "@/lib/sessions";
import { cn } from "@/lib/utils";
import { FeedbackCard } from "@/components/FeedbackCard";
import { getAiFeedback } from "@/lib/feedback.functions";
import type { Feedback } from "@/lib/feedback";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/practice")({
  head: () => ({
    meta: [
      { title: "Practice · Daily Speaking Practice" },
      { name: "description", content: "Speak on today's topic and see your words appear live." },
      { property: "og:title", content: "Practice · Daily Speaking Practice" },
      { property: "og:description", content: "Speak on today's topic and see your words appear live." },
    ],
  }),
  component: PracticePage,
});

type Phase = "idle" | "recording" | "stopped";

function PracticePage() {
  const topic = topicForDate(new Date());
  const speech = useSpeechRecognition();
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const fetchFeedback = useServerFn(getAiFeedback);
  const startedAt = useRef(0);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (phase !== "recording") return;
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 250);
    return () => clearInterval(id);
  }, [phase]);

  // If recognition stops on its own (e.g. mic blocked), end the recording.
  useEffect(() => {
    if (phase === "recording" && speech.error) setPhase("stopped");
  }, [phase, speech.error]);

  function start() {
    setSeconds(0);
    startedAt.current = Date.now();
    speech.start();
    setPhase("recording");
  }

  function stop() {
    speech.stop();
    setSeconds(Math.floor((Date.now() - startedAt.current) / 1000));
    setPhase("stopped");
  }

  function redo() {
    speech.reset();
    setFeedback(null);
    setFeedbackError(null);
    setSeconds(0);
    setPhase("idle");
  }

  const transcript = [speech.finalText, speech.interimText].filter(Boolean).join(" ").trim();

  async function askFeedback() {
    setFeedbackLoading(true);
    setFeedbackError(null);
    try {
      const res = await fetchFeedback({ data: { topic, transcript } });
      if (res.error) setFeedbackError(res.error);
      else setFeedback(res.feedback);
    } catch {
      setFeedbackError("Sorry, the AI coach couldn't check this right now. Please try again in a moment.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("sessions").insert({
      topic,
      transcript,
      duration_seconds: seconds,
      feedback: feedback ? (JSON.parse(JSON.stringify(feedback)) as Json) : null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: sessionsQuery.queryKey });
    toast.success("Session saved");
    navigate({ to: "/history" });
  }

  const recording = phase === "recording";
  const hasText = speech.finalText || speech.interimText;

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Today's topic</p>
      <h1 className="mt-2 text-2xl font-semibold">{topic}</h1>

      <p className="mt-8 font-display text-5xl font-semibold tabular-nums" aria-live="polite">
        {formatDuration(seconds)}
      </p>

      <div className="relative my-10 flex size-44 items-center justify-center">
        {recording && (
          <>
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-mic-ring" />
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-mic-ring [animation-delay:0.8s]" />
          </>
        )}
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={speech.supported === false || phase === "stopped"}
          aria-label={recording ? "Stop recording" : "Start recording"}
          className={cn(
            "relative flex size-40 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-mic transition-transform active:scale-95 disabled:opacity-40",
          )}
        >
          {recording ? <Square className="size-12 fill-current" /> : <Mic className="size-16" />}
        </button>
      </div>

      {speech.supported === false && (
        <p className="text-sm text-destructive">
          Your browser doesn't support speech-to-text. Please try Chrome, Edge or Safari.
        </p>
      )}
      {speech.error && <p className="text-sm text-destructive">{speech.error}</p>}

      {phase === "idle" && speech.supported !== false && (
        <p className="text-sm text-muted-foreground">Tap the mic and start speaking.</p>
      )}

      {recording && (
        <Button variant="outline" size="lg" className="rounded-full" onClick={stop}>
          <Square className="fill-current" /> Stop
        </Button>
      )}

      {phase === "stopped" && (
        <div className="w-full space-y-3">
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 rounded-full"
              onClick={askFeedback}
              disabled={!transcript || feedbackLoading || saving || !!feedback}
            >
              {feedbackLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {feedbackLoading ? "Checking…" : "Get AI Feedback"}
            </Button>
            <Button size="lg" className="flex-1 rounded-full" onClick={save} disabled={saving || feedbackLoading}>
              <Save /> {saving ? "Saving…" : "Save"}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={redo} disabled={saving || feedbackLoading}>
            <RotateCcw /> Redo
          </Button>
          {feedbackError && (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{feedbackError}</p>
          )}
        </div>
      )}

      {(phase !== "idle" || hasText) && (
        <div className="surface mt-6 min-h-32 w-full p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Transcript</p>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed">
            {speech.finalText}
            {speech.interimText && <span className="text-muted-foreground"> {speech.interimText}</span>}
            {!hasText && <span className="italic text-muted-foreground">{recording ? "Listening…" : "No words captured."}</span>}
          </p>
        </div>
      )}

      {feedback && (
        <div className="mt-4 w-full">
          <FeedbackCard feedback={feedback} />
        </div>
      )}
    </div>
  );
}
