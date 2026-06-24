import { runCommand } from "@/lib/hermes/commands";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    text?: string;
    sender?: string;
  };
  const result = await runCommand(body.text ?? "", "web", body.sender ?? "founder");
  return Response.json(result);
}
