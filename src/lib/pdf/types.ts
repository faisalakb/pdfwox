export type PdfBytes = Uint8Array;

export type ProgressFn = (pct: number) => void;

export type PageSize = "A4" | "Letter" | "Fit";

export interface ImageItem {
  bytes: Uint8Array;
  mime: string; // "image/png" | "image/jpeg" | "image/heic" | "image/heif"
}

export interface ImagesToPdfOptions {
  pageSize: PageSize;
  margin: "none" | "narrow" | "normal";
}

export interface ProtectOptions {
  userPassword: string;
  ownerPassword?: string;
  permissions?: {
    printing?: boolean;
    modifying?: boolean;
    copying?: boolean;
  };
}

export type FormFieldValue = string | boolean | string[];
export type FormValues = Record<string, FormFieldValue>;

export class NotImplementedError extends Error {
  constructor(feature: string, eta?: string) {
    super(
      eta
        ? `${feature} — not implemented (${eta})`
        : `${feature} — not implemented`,
    );
    this.name = "NotImplementedError";
  }
}
