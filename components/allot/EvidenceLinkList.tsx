"use client";

import { ExternalLink } from "lucide-react";

interface Props { urls: string[] }

export function EvidenceLinkList({ urls }: Props) {
  if (!urls || urls.length === 0) {
    return <span className="text-xs text-[#475569] italic">No evidence submitted</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      {urls.map((url, i) => (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[#60a5fa] hover:text-[#93c5fd] transition-colors group"
        >
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-xs group-hover:underline">{url}</span>
        </a>
      ))}
    </div>
  );
}
