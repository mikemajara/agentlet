"use client";

import { useCallback, useState } from "react";
import { FileTextIcon, RefreshCwIcon } from "lucide-react";
import { CompanionPanel } from "@/components/CompanionPanel";
import { GitHubAllowControl } from "@/components/GitHubAllowControl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { GitHubAllowPublicStatus } from "@/lib/github-grant/public-dto";

type Note = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  body: string;
  tags: string[];
};

type WorkspaceAppProps = {
  initialNotes: Note[];
  initialBackend: string;
  initialError: string | null;
  initialAllowStatus: GitHubAllowPublicStatus;
};

export function WorkspaceApp({
  initialNotes,
  initialBackend,
  initialError,
  initialAllowStatus,
}: WorkspaceAppProps) {
  const [backend, setBackend] = useState(initialBackend);
  const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [companionOpen, setCompanionOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notes");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load notes");
      setNotes(json.notes ?? []);
      setBackend(json.backend ?? "unknown");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  async function onAddNote(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, tags }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to add note");
      setNotes(json.notes ?? []);
      setBackend(json.backend ?? backend);
      setTitle("");
      setBody("");
      setTags("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
              JSON · files-sdk · Eve
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              agentlet
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">storage: {backend}</Badge>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refresh()}
              disabled={loading}
            >
              <RefreshCwIcon data-icon="inline-start" />
              Refresh
            </Button>
            <Button type="button" onClick={() => setCompanionOpen(true)}>
              Companion
            </Button>
          </div>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Tiny kit for a cheap, quick agent web app. Durable state is JSON files
          on object storage. Default is Vercel Blob; R2 and local{" "}
          <code className="font-mono">./data</code> work too.
        </p>
      </header>

      <GitHubAllowControl initialStatus={initialAllowStatus} />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not update notes</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Add note</CardTitle>
              <CardDescription>
                Writes to <code className="font-mono">notes.json</code>.
              </CardDescription>
            </CardHeader>
            <form onSubmit={onAddNote}>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="note-title">Title</FieldLabel>
                    <Input
                      id="note-title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="note-body">Body</FieldLabel>
                    <Textarea
                      id="note-body"
                      required
                      rows={4}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="note-tags">Tags</FieldLabel>
                    <Input
                      id="note-tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="space or comma separated"
                    />
                    <FieldDescription>
                      Optional. Split on spaces or commas.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? <Spinner data-icon="inline-start" /> : null}
                  {saving ? "Saving…" : "Add note"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                From <code className="font-mono">notes.json</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileTextIcon />
                    </EmptyMedia>
                    <EmptyTitle>No notes yet</EmptyTitle>
                    <EmptyDescription>
                      Add one on the left, or ask the companion to write it.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ul className="flex flex-col">
                  {notes.map((n, i) => (
                    <li key={n.id}>
                      {i > 0 ? <Separator /> : null}
                      <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-medium">{n.title}</h3>
                          <span className="font-mono text-xs text-muted-foreground">
                            {String(n.updated_at ?? n.created_at).slice(0, 19)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                          {n.body}
                        </p>
                        {n.tags?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {n.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <CompanionPanel open={companionOpen} onOpenChange={setCompanionOpen} />
    </div>
  );
}
