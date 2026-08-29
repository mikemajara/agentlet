"use client";

import { useMemo, useState } from "react";
import { LayoutGridIcon } from "lucide-react";
import { CompanionPanel } from "@/components/CompanionPanel";
import type { CatalogListing, CatalogTag } from "@/lib/catalog";
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

type CatalogAppProps = {
  listings: CatalogListing[];
  tags: CatalogTag[];
};

export function CatalogApp({ listings, tags }: CatalogAppProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [companionOpen, setCompanionOpen] = useState(false);

  const visible = useMemo(() => {
    if (!activeTag) return listings;
    return listings.filter((item) => item.tags.includes(activeTag));
  }, [activeTag, listings]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
              catalog · git · Eve
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              agentlet
            </h1>
          </div>
          <Button type="button" onClick={() => setCompanionOpen(true)}>
            Companion
          </Button>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Free catalog of tiny, cheap agent web apps. Pick one, Deploy or clone
          that folder only. The list is{" "}
          <code className="font-mono">catalog.json</code>.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeTag === null ? "default" : "outline"}
            onClick={() => setActiveTag(null)}
          >
            All
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag.id}
              type="button"
              size="sm"
              variant={activeTag === tag.id ? "default" : "outline"}
              onClick={() => setActiveTag(tag.id)}
            >
              {tag.label}
            </Button>
          ))}
        </div>
      </header>

      {visible.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutGridIcon />
            </EmptyMedia>
            <EmptyTitle>No listings for this tag</EmptyTitle>
            <EmptyDescription>
              v1 only ships Notes under Starter. Memory and self-modifying are
              filters for later examples.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((item) => (
            <li key={item.id}>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle>{item.title}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-xs text-muted-foreground">
                    {item.examplePath}
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
                    {item.createCommand}
                  </pre>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button asChild>
                    <a href={item.deployUrl}>Deploy</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a
                      href={`https://github.com/mikemajara/agentlet/tree/main/${item.examplePath}`}
                    >
                      View source
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <CompanionPanel open={companionOpen} onOpenChange={setCompanionOpen} />
    </div>
  );
}
