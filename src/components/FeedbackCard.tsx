import { CheckCircle2, Lightbulb, Sparkles } from "lucide-react";
import type { Feedback } from "@/lib/feedback";
import { cn } from "@/lib/utils";

export function FeedbackCard({ feedback, compact = false }: { feedback: Feedback; compact?: boolean }) {
  return (
    <div className={cn("space-y-4 text-left", compact ? "rounded-xl bg-secondary/60 p-3" : "surface p-4")}>
      {(feedback.score != null || feedback.fluency_score != null) && (
        <div className="grid grid-cols-2 gap-2">
          <ScoreBadge label="Grammar" score={feedback.score} reason={feedback.score_reason} compact={compact} />
          <ScoreBadge label="Fluency" score={feedback.fluency_score} reason={feedback.fluency_reason} compact={compact} />
        </div>
      )}

      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="size-3.5" /> Corrected
        </p>
        <p className="mt-1.5 text-sm leading-relaxed">{feedback.corrected_text}</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mistakes</p>
        {feedback.mistakes.length === 0 ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-primary">
            <CheckCircle2 className="size-4" /> No mistakes — great job!
          </p>
        ) : (
          <ul className="mt-1.5 space-y-2">
            {feedback.mistakes.map((m, i) => (
              <li key={i} className="rounded-lg bg-card p-2.5 text-sm">
                <p>
                  <span className="text-destructive line-through">{m.wrong}</span>
                  <span className="mx-1.5 text-muted-foreground">→</span>
                  <span className="font-medium text-primary">{m.correct}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{m.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2 rounded-lg bg-primary-soft p-2.5 text-sm text-accent-foreground">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>{feedback.tip}</p>
      </div>
    </div>
  );
}

function ScoreBadge({
  label,
  score,
  reason,
  compact,
}: {
  label: string;
  score?: number | null | undefined;
  reason?: string | null | undefined;
  compact: boolean;
}) {
  return (
    <div className="rounded-xl bg-gradient-primary p-3 text-primary-foreground">
      <p className="text-xs font-semibold uppercase tracking-widest opacity-80">{label}</p>
      <p className={cn("font-display font-semibold leading-none", compact ? "mt-1 text-3xl" : "mt-1.5 text-4xl")}>
        {score ?? "–"}
        <span className="text-base font-medium opacity-70">/10</span>
      </p>
      {reason && <p className="mt-1.5 text-xs leading-snug opacity-90">{reason}</p>}
    </div>
  );
}
