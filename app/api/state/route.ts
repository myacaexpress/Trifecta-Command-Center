import { getState } from "@/lib/db/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getState());
}
