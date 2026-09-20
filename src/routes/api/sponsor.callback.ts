import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { creditPoints, maybeQualifyReferral, notify, recordCampaignSpend } from "@/lib/server/helpers";

export const Route = createFileRoute("/api/sponsor/callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { token?: string; secret?: string };
        const expected = process.env.SPONSOR_CALLBACK_SECRET;
        if (expected && body.secret !== expected) {
          return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        if (!body.token) {
          return Response.json({ success: false, message: "Missing token" }, { status: 400 });
        }
        const sql = await getSql();
        const rows = await sql<{
          id: number;
          user_id: string;
          task_id: number;
          status: string;
        }>`
          select id, user_id, task_id, status from task_completions where token = ${body.token}
        `;
        const c = rows[0];
        if (!c) return Response.json({ success: false, message: "Unknown token" }, { status: 404 });
        if (c.status !== "started" && c.status !== "pending") {
          return Response.json({ success: true, message: "Already processed" });
        }
        const task = await sql<{
          title: string;
          reward_points: number;
          campaign_id: number | null;
          verification_type: string;
        }>`select title, reward_points, campaign_id, verification_type from tasks where id = ${c.task_id}`;
        const t = task[0];
        if (!t || t.verification_type !== "sponsor_callback") {
          return Response.json({ success: false, message: "Task does not accept callbacks" }, { status: 400 });
        }
        await recordCampaignSpend(sql, t.campaign_id);
        await sql`
          update task_completions set status = 'completed', submitted_at = now(), updated_at = now()
          where id = ${c.id}
        `;
        await sql`update tasks set completion_count = completion_count + 1 where id = ${c.task_id}`;
        await sql`update app_profiles set tasks_completed = tasks_completed + 1 where user_id = ${c.user_id}`;
        await creditPoints(sql, c.user_id, Number(t.reward_points), "task_reward", t.title, "task", String(c.task_id));
        await maybeQualifyReferral(sql, c.user_id);
        await notify(sql, c.user_id, "task_approved", "Task verified", `+${t.reward_points} points for ${t.title}.`);
        return Response.json({ success: true, message: "Completion recorded" });
      },
    },
  },
});
