"use client";

import * as React from "react";
import { Caveat } from "next/font/google";
import { Dropzone } from "@/components/Dropzone";
import { PdfPreview, type PageMeta } from "@/components/PdfPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { HelpText, Input, Label } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/States";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import type { SignaturePlacement } from "@/lib/pdf/placeSignature";
import { getPdfApi } from "@/lib/workers/pdfClient";

type Phase = "empty" | "creating" | "placing" | "processing" | "done" | "error";

const TOOL_SLUG = "/sign-pdf";
const STORAGE_KEY = "privpdf:sig:v1";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

interface SavedSig {
  /** Data URL of the signature PNG. */
  dataUrl: string;
  /** Original natural size of the rendered PNG. */
  width: number;
  height: number;
}

async function dataUrlToBytes(
  url: string,
): Promise<{ bytes: Uint8Array; mime: "image/png" }> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return { bytes: new Uint8Array(buf), mime: "image/png" };
}

export function SignShell() {
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [bytes, setBytes] = React.useState<Uint8Array | null>(null);
  const [filename, setFilename] = React.useState("signed.pdf");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageMeta, setPageMeta] = React.useState<PageMeta | null>(null);
  const [tab, setTab] = React.useState<"draw" | "type" | "upload">("draw");
  const [typedName, setTypedName] = React.useState("");
  const [signature, setSignature] = React.useState<SavedSig | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedSig;
        if (parsed?.dataUrl) return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  });
  const [persist, setPersist] = React.useState(true);
  const [placements, setPlacements] = React.useState<
    Array<{
      page: number;
      display: { x: number; y: number; width: number; height: number };
      meta: PageMeta;
    }>
  >([]);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const drawCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);
  const lastPt = React.useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    track({ type: "tool_viewed", tool: TOOL_SLUG });
  }, []);

  React.useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const onAccepted = React.useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      track({
        type: "file_added",
        tool: TOOL_SLUG,
        fileType: file.type || "application/pdf",
        sizeBucket: bucketBytes(file.size),
      });
      setFilename(file.name.replace(/\.pdf$/i, "") + "-signed.pdf");
      setBytes(new Uint8Array(await file.arrayBuffer()));
      setPhase(signature ? "placing" : "creating");
    },
    [signature],
  );

  const reset = React.useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setBytes(null);
    setPlacements([]);
    setPageIndex(0);
    setPageMeta(null);
    setDownloadUrl(null);
    setErrorMsg(null);
    setTypedName("");
    setPhase("empty");
  }, [downloadUrl]);

  /* ───── Draw mode ───── */
  const handleDrawStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    drawing.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    lastPt.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };
  const handleDrawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (lastPt.current) {
      ctx.strokeStyle = "#1a1a1f";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPt.current.x, lastPt.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    lastPt.current = pt;
  };
  const handleDrawEnd = () => {
    drawing.current = false;
    lastPt.current = null;
  };
  const handleDrawClear = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };
  const captureDrawnSignature = async () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSignature({ dataUrl, width: canvas.width, height: canvas.height });
    if (persist) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            dataUrl,
            width: canvas.width,
            height: canvas.height,
          }),
        );
      } catch {
        /* ignore quota */
      }
    }
    if (bytes) setPhase("placing");
  };

  /* ───── Type mode ───── */
  const captureTypedSignature = () => {
    const text = typedName.trim();
    if (!text) return;
    const dpr = 2;
    const fontSize = 64;
    const canvas = document.createElement("canvas");
    canvas.width = 600 * dpr;
    canvas.height = 160 * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#1a1a1f";
    ctx.font = `${fontSize}px "${caveat.style.fontFamily}", "Caveat", cursive`;
    ctx.textBaseline = "middle";
    ctx.fillText(text, 16, 80);
    const dataUrl = canvas.toDataURL("image/png");
    setSignature({ dataUrl, width: canvas.width, height: canvas.height });
    if (persist) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            dataUrl,
            width: canvas.width,
            height: canvas.height,
          }),
        );
      } catch {
        /* ignore quota */
      }
    }
    if (bytes) setPhase("placing");
  };

  /* ───── Upload mode ───── */
  const onUploadSignature = async (file: File) => {
    if (file.type !== "image/png" && file.type !== "image/jpeg") return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      // Decode to get natural dimensions.
      const img = new Image();
      img.onload = () => {
        setSignature({
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        if (persist) {
          try {
            window.localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                dataUrl,
                width: img.naturalWidth,
                height: img.naturalHeight,
              }),
            );
          } catch {
            /* ignore */
          }
        }
        if (bytes) setPhase("placing");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  /* ───── Place mode ───── */
  const overlay = React.useCallback(
    (meta: PageMeta) => {
      const pagePlacements = placements.filter((p) => p.page === pageIndex);
      const aspect = signature ? signature.height / signature.width : 0.33;
      return (
        <>
          {pagePlacements.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              alt=""
              src={signature?.dataUrl ?? ""}
              className="pointer-events-none absolute"
              style={{
                left: p.display.x,
                top: p.display.y,
                width: p.display.width,
                height: p.display.height,
              }}
            />
          ))}
          <div
            data-testid="place-layer"
            className="absolute inset-0 cursor-crosshair"
            onPointerDown={(e) => {
              if (e.button !== 0 || !signature) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const cx = e.clientX - rect.left;
              const cy = e.clientY - rect.top;
              // Default width = 160 CSS px (about 80pt in PDF space at 1.5x).
              const w = 160;
              const h = w * aspect;
              setPlacements((curr) => [
                ...curr,
                {
                  page: pageIndex,
                  display: {
                    x: cx - w / 2,
                    y: cy - h / 2,
                    width: w,
                    height: h,
                  },
                  meta,
                },
              ]);
            }}
          />
        </>
      );
    },
    [placements, pageIndex, signature],
  );

  const onApply = React.useCallback(async () => {
    if (!bytes || !signature || placements.length === 0) return;
    setPhase("processing");
    track({ type: "tool_started", tool: TOOL_SLUG });
    const t0 = performance.now();
    try {
      const { bytes: sigBytes, mime } = await dataUrlToBytes(signature.dataUrl);
      const specs: SignaturePlacement[] = placements.map((p) => {
        const sx = p.meta.pdfWidth / p.meta.width;
        const sy = p.meta.pdfHeight / p.meta.height;
        return {
          page: p.page,
          x: p.display.x * sx,
          y: p.meta.pdfHeight - (p.display.y + p.display.height) * sy,
          width: p.display.width * sx,
          height: p.display.height * sy,
          imageBytes: sigBytes,
          mime,
        };
      });
      const api = await getPdfApi();
      const out = await api.placeSignature(bytes, specs);
      const blob = new Blob([new Uint8Array(out)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setPhase("done");
      track({
        type: "tool_succeeded",
        tool: TOOL_SLUG,
        durationMs: Math.round(performance.now() - t0),
      });
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      setErrorMsg(reason);
      setPhase("error");
      track({
        type: "tool_failed",
        tool: TOOL_SLUG,
        fileType: "application/pdf",
        browser: detectBrowser(),
        sizeBucket: bucketBytes(bytes.byteLength),
        reason,
      });
    }
  }, [bytes, signature, placements]);

  if (phase === "empty") {
    return (
      <Dropzone
        accepts={["application/pdf"]}
        multiple={false}
        onAccepted={onAccepted}
        label="Drop a PDF to sign"
        hint="Draw your signature, type it, or upload an image. Then click on the page to place it."
      />
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="Couldn’t sign that PDF"
        description={errorMsg ?? "Try again with a different file."}
        action={
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
        }
      />
    );
  }

  if (phase === "creating") {
    return (
      <Card>
        <h3 className="font-display text-lg">Create a signature</h3>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Pick a method, then save to place it on the page.
        </p>
        <div className="mt-4">
          <Tabs
            defaultValue="draw"
            value={tab}
            onValueChange={(v) => setTab(v as typeof tab)}
          >
            <TabsList>
              <TabsTrigger value="draw">Draw</TabsTrigger>
              <TabsTrigger value="type">Type</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="mt-4 space-y-3">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)]">
                <canvas
                  ref={drawCanvasRef}
                  width={600}
                  height={160}
                  data-testid="sig-canvas"
                  className="block w-full touch-none"
                  onPointerDown={handleDrawStart}
                  onPointerMove={handleDrawMove}
                  onPointerUp={handleDrawEnd}
                  onPointerLeave={handleDrawEnd}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" onClick={handleDrawClear}>
                  Clear
                </Button>
                <Button onClick={captureDrawnSignature}>Save signature</Button>
              </div>
            </TabsContent>

            <TabsContent value="type" className="mt-4 space-y-3">
              <Label htmlFor="typed">Type your name</Label>
              <Input
                id="typed"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Your name"
              />
              <div
                className={cn(
                  "min-h-20 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-3 text-5xl",
                  caveat.className,
                )}
              >
                {typedName || (
                  <span className="text-[var(--color-ink-subtle)]">
                    Preview
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <HelpText>
                  Renders in a handwritten font. Looks signature-like in any
                  reader.
                </HelpText>
                <Button
                  onClick={captureTypedSignature}
                  disabled={!typedName.trim()}
                >
                  Save signature
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-4 space-y-3">
              <Label htmlFor="sig-upload">
                Upload a signature image (PNG with transparency works best)
              </Label>
              <input
                id="sig-upload"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onUploadSignature(f);
                }}
                className="focus-ring block w-full text-sm"
              />
              <HelpText>
                Any PNG or JPG works. Transparent PNG keeps the page visible
                behind the signature strokes.
              </HelpText>
            </TabsContent>
          </Tabs>
          <label className="mt-4 flex cursor-pointer items-center gap-2.5">
            <Checkbox
              checked={persist}
              onChange={(e) => setPersist(e.target.checked)}
            />
            <span className="text-sm">
              Remember this signature on this device
            </span>
          </label>
        </div>
      </Card>
    );
  }

  // phase === "placing" | "processing" | "done"
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {bytes ? (
            <PdfPreview
              bytes={bytes}
              pageIndex={pageIndex}
              onPageChange={setPageIndex}
              onPageMeta={setPageMeta}
              overlay={overlay}
            />
          ) : null}
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
            Click the page to place the signature. Switch pages with the arrows
            above the preview.
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="font-display text-lg">Signature</h3>
            {signature ? (
              <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={signature.dataUrl}
                  alt="Your signature"
                  className="block max-h-24 w-auto"
                />
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                No signature yet.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPhase("creating")}
              >
                Change
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  try {
                    window.localStorage.removeItem(STORAGE_KEY);
                  } catch {
                    /* ignore */
                  }
                  setSignature(null);
                  setPhase("creating");
                }}
              >
                Forget saved
              </Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Placements</h3>
              <span className="text-xs text-[var(--color-ink-muted)]">
                {placements.length}
              </span>
            </div>
            {placements.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                Click on the page to add one.
              </p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {placements.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2"
                  >
                    <span>Page {p.page + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setPlacements((curr) => curr.filter((_, j) => j !== i))
                      }
                      className="focus-ring text-[var(--color-ink-muted)] hover:text-[var(--color-danger)]"
                      aria-label={`Remove placement ${i + 1}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div>
            <Label htmlFor="sign-filename">Filename</Label>
            <Input
              id="sign-filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              disabled={phase === "processing"}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={reset}>
              Start over
            </Button>
            {phase === "done" && downloadUrl ? (
              <a
                href={downloadUrl}
                download={filename}
                onClick={() =>
                  track({ type: "download_clicked", tool: TOOL_SLUG })
                }
                className="focus-ring inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 text-base font-medium text-[var(--color-accent-ink)] transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                Download
              </a>
            ) : (
              <Button
                onClick={onApply}
                disabled={
                  phase === "processing" ||
                  placements.length === 0 ||
                  !signature ||
                  !pageMeta
                }
              >
                {phase === "processing"
                  ? "Signing…"
                  : `Sign & download (${placements.length})`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
