import { defineTool } from "eve/tools";
import { z } from "zod";
import { listAppSourceFiles } from "@/lib/git-write";

export default defineTool({
  description:
    "List text source file paths in this app's GitHub repository. Requires GitHub write grant.",
  inputSchema: z.object({}),
  async execute() {
    return await listAppSourceFiles();
  },
});
