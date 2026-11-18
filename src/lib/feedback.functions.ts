import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAiFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ topic: z.string().min(1).max(300), transcript: z.string().min(1).max(10000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { generateFeedback } = await import("./feedback.server");
    return generateFeedback(data.topic, data.transcript);
  });
