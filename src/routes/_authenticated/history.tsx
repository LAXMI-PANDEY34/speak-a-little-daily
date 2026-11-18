import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { formatDuration } from "@/lib/practice";
import { sessionsQuery } from "@/lib/sessions";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "History · Daily Speaking Practice" },
      { name: "description", content: "All your past speaking practice sessions." },
      { property: "og:title", content: "History · Daily Speaking Practice" },
      { property: "og:description", content: "All your past speaking practice sessions." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsQuery),
  component: HistoryPage,
});

function HistoryPage() {
  const { data: sessions } = useSuspenseQuery(sessionsQuery);
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsQuery.queryKey });
      toast.success("Session deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">History</h1>
      {sessions.length === 0 ? (
        <div className="surface p-8 text-center">
          <p className="text-muted-foreground">No sessions yet.</p>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/practice">Start practicing</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li key={s.id} className="surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <h2 className="mt-0.5 font-semibold">{s.topic}</h2>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Delete session" className="-mr-2 -mt-1 text-muted-foreground">
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                      <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove.mutate(s.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                {s.transcript || <span className="italic text-muted-foreground">No words captured</span>}
              </p>
              <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                <Clock className="size-3.5" /> {formatDuration(s.duration_seconds)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
