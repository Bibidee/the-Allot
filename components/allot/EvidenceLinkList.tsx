"use client";

import { ExternalLink } from "lucide-react";

interface Props { urls: string[] }

export function EvidenceLinkList({ urls }: Props) {
  if (!urls || urls.length === 0) {
    return <span className="text-xs italic" style={{ color: "var(--text-3)" }}>No evidence submitted</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      {urls.map((url, i) => (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs transition-colors group"
          style={{ color: "var(--court-blue-b)" }}
        >
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-xs group-hover:underline">{url}</span>
        </a>
      ))}
    </div>
  );
}
