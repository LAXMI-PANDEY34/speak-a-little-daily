import { Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TOPIC_LEVELS } from "@/lib/practice";
import { cn } from "@/lib/utils";

export function TopicChooser({
  open,
  onOpenChange,
  current,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: string;
  onSelect: (topic: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="font-display">Choose a topic</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-5 pb-4">
          {TOPIC_LEVELS.map(({ level, topics }) => (
            <section key={level}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">{level}</h3>
              <ul className="mt-2 space-y-1.5">
                {topics.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      onClick={() => onSelect(t)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors",
                        t === current ? "border-primary bg-primary-soft text-accent-foreground" : "bg-card hover:bg-muted",
                      )}
                    >
                      {t}
                      {t === current && <Check className="size-4 text-primary" />}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
