import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const sessionsQuery = queryOptions({
  queryKey: ["sessions"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("sessions")
      .select("id, topic, transcript, duration_seconds, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
