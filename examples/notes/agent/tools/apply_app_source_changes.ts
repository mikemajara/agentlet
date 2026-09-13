import { defineTool } from "eve/tools";
import { z } from "zod";
import { applyAppSourceChanges } from "@/lib/git-write";

export default defineTool({
  description:
    "Commit source file changes to this app's default Git branch on GitHub. Vercel redeploys automatically. Requires GitHub write grant. Never commit secrets or .env files.",
  inputSchema: z.object({
    summary: z
      .string()
      .min(1)
      .describe("Commit message and plain-language description of the change"),
    files: z
      .array(
        z.object({
          path: z.string().min(1),
          content: z.string(),
        }),
      )
      .describe("Files to create or update"),
    deletePaths: z
      .array(z.string().min(1))
      .optional()
      .describe("Repo-relative paths to delete"),
  }),
  async execute(input) {
    return await applyAppSourceChanges(
      input.summary,
      input.files,
      input.deletePaths ?? [],
    );
  },
});
