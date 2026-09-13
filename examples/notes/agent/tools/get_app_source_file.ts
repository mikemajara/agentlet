import { defineTool } from "eve/tools";
import { z } from "zod";
import { getAppSourceFile } from "@/lib/git-write";

export default defineTool({
  description:
    "Read one source file from this app's GitHub repository. Requires GitHub write grant.",
  inputSchema: z.object({
    path: z.string().min(1).describe("Repo-relative file path"),
  }),
  async execute(input) {
    return await getAppSourceFile(input.path);
  },
});
