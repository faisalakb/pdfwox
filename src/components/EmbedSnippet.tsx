"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

export function EmbedSnippet({ toolSlug }: { toolSlug: string }) {
  const slug = toolSlug.replace(/^\//, "");
  const embedUrl = `${SITE.url}/embed/${slug}`;
  const snippet = `<iframe
  src="${embedUrl}"
  width="100%"
  height="600"
  style="border:none;border-radius:8px"
  title="${slug} tool"
  allow="downloads"
  loading="lazy"
></iframe>
<script>
window.addEventListener('message',function(e){
  if(e.data&&e.data.type==='privpdf-resize'){
    var f=document.querySelector('iframe[src="${embedUrl}"]');
    if(f)f.style.height=e.data.height+'px';
  }
});
</script>`;

  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-3">
      <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-muted)] p-4 text-xs leading-relaxed">
        <code>{snippet}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="focus-ring inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-sm font-medium hover:bg-[var(--color-surface-muted)]"
      >
        {copied ? "Copied!" : "Copy embed code"}
      </button>
      <p className="text-xs text-[var(--color-ink-muted)]">
        The embed runs entirely in the visitor's browser — no files are uploaded.
        The iframe resizes automatically to fit its content via{" "}
        <code className="rounded bg-[var(--color-surface-muted)] px-1">postMessage</code>.
      </p>
    </div>
  );
}
