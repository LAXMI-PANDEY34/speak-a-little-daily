import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Flame, ListChecks, LogOut, Mic, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { computeStreak, dayKey, randomTopic } from "@/lib/practice";
import { useActiveTopic } from "@/lib/selected-topic";
import { TopicChooser } from "@/components/TopicChooser";
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
  const { topic, isCustom, choose, reset } = useActiveTopic();
  const [chooserOpen, setChooserOpen] = useState(false);
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
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
          {isCustom ? "Your topic" : "Today's topic"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">{topic}</h1>
        <Button asChild variant="secondary" size="lg" className="mt-6 w-full rounded-full">
          <Link to="/practice">
            <Mic /> Start speaking
          </Link>
        </Button>
      </section>

      <div className="-mt-2 space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="rounded-full" onClick={() => choose(randomTopic(topic))}>
            <Shuffle /> Random topic
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => setChooserOpen(true)}>
            <ListChecks /> Choose topic
          </Button>
        </div>
        {isCustom && (
          <button type="button" onClick={reset} className="block w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline">
            Back to today's topic
          </button>
        )}
      </div>

      <TopicChooser
        open={chooserOpen}
        onOpenChange={setChooserOpen}
        current={topic}
        onSelect={(t) => {
          choose(t);
          setChooserOpen(false);
        }}
      />

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
