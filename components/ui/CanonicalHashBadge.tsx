"use client";

interface Props { hash: string }

export function CanonicalHashBadge({ hash }: Props) {
  if (!hash) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs"
      style={{ background: "var(--vault-surface)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
      <span className="uppercase tracking-widest text-[10px]"
        style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
        Canonical Hash
      </span>
      <span className="break-all"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--court-blue-b)" }}>
        {hash}
      </span>
    </div>
  );
}
