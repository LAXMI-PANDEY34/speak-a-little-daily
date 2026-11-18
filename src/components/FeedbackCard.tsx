import { CheckCircle2, Lightbulb, Sparkles } from "lucide-react";
import type { Feedback } from "@/lib/feedback";
import { cn } from "@/lib/utils";

export function FeedbackCard({ feedback, compact = false }: { feedback: Feedback; compact?: boolean }) {
  return (
    <div className={cn("space-y-4 text-left", compact ? "rounded-xl bg-secondary/60 p-3" : "surface p-4")}>
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
