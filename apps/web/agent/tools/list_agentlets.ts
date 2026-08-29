import { defineTool } from "eve/tools";
import { z } from "zod";
import { listAgentlets } from "@/lib/catalog";

export default defineTool({
  description:
    "List catalog agentlets from catalog.json. Optional capability tag filter (starter, memory, self-modifying).",
  inputSchema: z.object({
    tag: z.string().optional(),
  }),
  async execute(input) {
    return await listAgentlets(input);
  },
});
