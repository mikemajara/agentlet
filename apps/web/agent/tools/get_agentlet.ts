import { defineTool } from "eve/tools";
import { z } from "zod";
import { getAgentlet } from "@/lib/catalog";

export default defineTool({
  description: "Get one catalog listing by id from catalog.json.",
  inputSchema: z.object({
    id: z.string().min(1),
  }),
  async execute({ id }) {
    const listing = getAgentlet(id);
    if (!listing) return { ok: false, error: `agentlet not found: ${id}` };
    return { ok: true, listing };
  },
});
