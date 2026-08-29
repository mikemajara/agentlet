"use client";

import { useEveAgent, type EveMessage } from "eve/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CompanionPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function textFromMessage(message: EveMessage): string {
  return message.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function toolNames(message: EveMessage): string[] {
  const names: string[] = [];
  for (const part of message.parts) {
    if (
      typeof part === "object" &&
      part &&
      "toolName" in part &&
      typeof (part as { toolName?: unknown }).toolName === "string"
    ) {
      names.push((part as { toolName: string }).toolName);
    }
  }
  return names;
}

export function CompanionPanel({ open, onOpenChange }: CompanionPanelProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const agent = useEveAgent();
  const isBusy = agent.status === "submitted" || agent.status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agent.data.messages, agent.status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isBusy) return;
    setDraft("");
    await agent.send({ message: text });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle>agentlet companion</SheetTitle>
          <SheetDescription>
            Catalog tools · status: {agent.status}
          </SheetDescription>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                agent.reset();
              }}
            >
              Reset
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-3 px-4 py-4">
            {agent.data.messages.length === 0 ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ask me which agentlet to deploy. I read{" "}
                <code className="font-mono">catalog.json</code> — I won&apos;t
                invent listings.
              </p>
            ) : null}

            {agent.data.messages.map((message) => {
              const tools = toolNames(message);
              const text = textFromMessage(message);
              return (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm leading-relaxed",
                    message.role === "user"
                      ? "ml-8 bg-primary text-primary-foreground"
                      : "mr-4 bg-muted text-foreground",
                  )}
                >
                  {tools.length > 0 ? (
                    <p className="mb-1 font-mono text-[10px] tracking-wide uppercase opacity-70">
                      tools: {tools.join(", ")}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap">{text || "…"}</p>
                </div>
              );
            })}

            {agent.error ? (
              <p className="text-sm text-destructive">{agent.error.message}</p>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <SheetFooter className="border-t">
          <form onSubmit={onSubmit} className="flex w-full flex-col gap-2">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="companion-draft" className="sr-only">
                  Message
                </FieldLabel>
                <Textarea
                  id="companion-draft"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  placeholder="What can I deploy? Filter by memory…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void onSubmit(e);
                    }
                  }}
                />
              </Field>
            </FieldGroup>
            <div className="flex justify-end">
              <Button type="submit" disabled={isBusy || !draft.trim()}>
                {isBusy ? <Spinner data-icon="inline-start" /> : null}
                {isBusy ? "Thinking…" : "Send"}
              </Button>
            </div>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
