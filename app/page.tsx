import { CommandCenter } from "@/components/command-center";
import { getState } from "@/lib/db/state";

export const dynamic = "force-dynamic";

export default async function Page() {
  const state = await getState();
  return <CommandCenter initialState={state} />;
}
