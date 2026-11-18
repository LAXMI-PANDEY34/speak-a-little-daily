import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock, Flame, Loader2, MessageSquareText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeStreak } from "@/lib/practice";
import { lastGrammarScores, totalMinutes } from "@/lib/progress";
import { sessionsQuery } from "@/lib/sessions";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progress · Daily Speaking Practice" },
      { name: "description", content: "Your sessions, minutes spoken, streak and grammar score trend." },
      { property: "og:title", content: "Progress · Daily Speaking Practice" },
      { property: "og:description", content: "Your sessions, minutes spoken, streak and grammar score trend." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsQuery),
  pendingComponent: () => (
    <div className="flex justify-center py-24 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Progress</h1>
      <div className="surface p-8 text-center">
        <p className="text-muted-foreground">We couldn't load your progress right now.</p>
        <Button className="mt-4 rounded-full" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  ),
  component: ProgressPage,
});

function ProgressPage() {
  const { data: sessions } = useSuspenseQuery(sessionsQuery);
  const streak = computeStreak(sessions.map((s) => new Date(s.created_at)));
  const scores = lastGrammarScores(sessions).map((s) => ({
    ...s,
    label: new Date(s.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
  }));

  if (sessions.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-3xl font-semibold">Progress</h1>
        <div className="surface flex flex-col items-center p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <TrendingUp className="size-7" />
          </div>
          <p className="mt-4 font-medium">No progress yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Do your first practice and your stats will show up here.</p>
          <Button asChild className="mt-5 rounded-full">
            <Link to="/practice">Start practicing</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Progress</h1>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={MessageSquareText} value={sessions.length} label="Sessions" />
        <Stat icon={Clock} value={totalMinutes(sessions)} label="Minutes" />
        <Stat icon={Flame} value={streak} label="Day streak" />
      </div>

      <section className="surface p-4">
        <h2 className="font-semibold">Grammar score</h2>
        <p className="text-xs text-muted-foreground">Last {scores.length || 7} sessions with AI feedback</p>
        {scores.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Tap "Get AI Feedback" before saving a session to see your score here.
          </p>
        ) : (
          <div className="mt-4 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scores} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }}
                  formatter={(v) => [`${v}/10`, "Grammar"]}
                />
                <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Clock; value: number; label: string }) {
  return (
    <div className="surface flex flex-col items-center p-3 text-center">
      <Icon className="size-5 text-primary" />
      <p className="mt-1.5 font-display text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
