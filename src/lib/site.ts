export const SITE = {
  name: "PdfWox",
  shortName: "PdfWox",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfwox.com",
  description:
    "Free PDF tools that run entirely in your browser. No uploads, no signup, no tracking — your files never leave your device.",
  tagline: "Works in your browser · No signup · Files stay private",
  email: "hello@pdfwox.com",
  ogImage: "/og-default.png",
  twitter: "@pdfwox",
  social: {
    github: "https://github.com/",
    twitter: "https://twitter.com/pdfwox",
  },
} as const;

export type Site = typeof SITE;
