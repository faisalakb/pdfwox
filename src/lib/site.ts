export const SITE = {
  name: "PrivPDF",
  shortName: "PrivPDF",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://privpdf.example",
  description:
    "Free PDF tools that run entirely in your browser. No uploads, no signup, no tracking — your files never leave your device.",
  tagline: "Works in your browser · No signup · Files stay private",
  email: "hello@privpdf.example",
  ogImage: "/og-default.png",
  twitter: "@privpdf",
  social: {
    github: "https://github.com/",
    twitter: "https://twitter.com/",
  },
} as const;

export type Site = typeof SITE;
