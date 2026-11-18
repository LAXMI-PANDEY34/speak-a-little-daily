import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Flame, LogOut, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { computeStreak, dayKey, topicForDate } from "@/lib/practice";
import { sessionsQuery } from "@/lib/sessions";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Today's topic · Daily Speaking Practice" },
      { name: "description", content: "Your speaking topic for today and your practice streak." },
      { property: "og:title", content: "Today's topic · Daily Speaking Practice" },
      { property: "og:description", content: "Your speaking topic for today and your practice streak." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsQuery),
  component: HomePage,
});

function HomePage() {
  const { data: sessions } = useSuspenseQuery(sessionsQuery);
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const today = new Date();
  const topic = topicForDate(today);
  const streak = computeStreak(sessions.map((s) => new Date(s.created_at)), today);
  const doneToday = sessions.some((s) => dayKey(new Date(s.created_at)) === dayKey(today));

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {today.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
          <LogOut />
        </Button>
      </header>

      <section className="rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-mic">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Today's topic</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">{topic}</h1>
        <Button asChild variant="secondary" size="lg" className="mt-6 w-full rounded-full">
          <Link to="/practice">
            <Mic /> Start speaking
          </Link>
        </Button>
      </section>

      <section className="surface flex items-center gap-4 p-5">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Flame className="size-7" />
        </div>
        <div>
          <p className="font-display text-3xl font-semibold leading-none">
            {streak} <span className="text-base font-medium text-muted-foreground">{streak === 1 ? "day" : "days"}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {doneToday ? "You practiced today. Nice!" : streak > 0 ? "Practice today to keep your streak." : "Practice today to start a streak."}
          </p>
        </div>
      </section>
    </div>
  );
}
