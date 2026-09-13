"use client";

import { useEffect, useState } from "react";
import { GitBranchIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { GitHubAllowPublicStatus } from "@/lib/github-grant/public-dto";

type GitHubAllowControlProps = {
  initialStatus: GitHubAllowPublicStatus;
  className?: string;
};

export function GitHubAllowControl({
  initialStatus,
  className,
}: GitHubAllowControlProps) {
  const [status] = useState(initialStatus);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("github_allow")) return;
    params.delete("github_allow");
    const next = params.toString();
    const path = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    window.history.replaceState({}, "", path);
  }, []);

  async function onAllow() {
    if (!status.canStart || !status.startUrl) return;
    setStarting(true);
    window.location.href = status.startUrl;
  }

  if (!status.visible) {
    return null;
  }

  if (status.granted) {
    return (
      <div className={className}>
        <Alert>
          <GitBranchIcon />
          <AlertTitle>GitHub write access</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const showPrimary =
    status.available && status.canStart && status.status === "not_granted";
  const showRetry =
    status.available &&
    status.canStart &&
    (status.status === "failed" ||
      status.status === "denied" ||
      status.status === "wrong_repo" ||
      status.status === "in_progress");

  return (
    <div className={className}>
      <Alert variant={status.status === "failed" ? "destructive" : "default"}>
        <GitBranchIcon />
        <AlertTitle>GitHub write access</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <span>{status.message}</span>
          {status.repo ? (
            <span className="font-mono text-xs text-muted-foreground">
              Repository: {status.repo}
            </span>
          ) : null}
          {!status.available ? (
            <span className="text-sm text-muted-foreground">
              {status.unavailableReason}
              {status.productionUrl ? (
                <>
                  {" "}
                  <a
                    href={status.productionUrl}
                    className="underline underline-offset-4"
                  >
                    Open production site
                  </a>
                </>
              ) : null}
            </span>
          ) : null}
          {showPrimary ? (
            <div>
              <Button type="button" onClick={() => void onAllow()} disabled={starting}>
                {starting ? <Spinner data-icon="inline-start" /> : null}
                Allow this app to edit its own code
              </Button>
            </div>
          ) : null}
          {showRetry && !showPrimary ? (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => void onAllow()}
                disabled={starting}
              >
                {starting ? <Spinner data-icon="inline-start" /> : null}
                Try Allow again
              </Button>
            </div>
          ) : null}
        </AlertDescription>
      </Alert>
    </div>
  );
}
