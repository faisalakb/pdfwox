import createMDX from "@next/mdx";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["react-dropzone", "comlink"],
  },
  async headers() {
    return [
      {
        // Static chunks are content-addressed (hash in filename) — cache forever.
        // This ensures CDNs and browsers keep old chunks alive after a redeploy,
        // preventing 404s for visitors/crawlers who have cached old HTML pages.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Embed routes: allow framing by any origin (the whole point of embeds)
        source: "/embed/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
          // X-Frame-Options cannot express "any origin" — omit it for embed routes
          // so the CSP frame-ancestors directive takes precedence.
        ],
      },
      {
        // Everything else: only allow framing by same origin (clickjacking protection)
        source: "/((?!embed).*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
  turbopack: {
    root: __dirname,
    rules: {
      // Register the MDX loader for non-page MDX imports
      // (e.g. `import Content from "./content.mdx"`). Page-level MDX
      // (foo/page.mdx) is handled separately by createMDX().
      "*.mdx": {
        loaders: ["@mdx-js/loader"],
        as: "*.tsx",
      },
    },
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

const withMDX = createMDX({
  options: {
    // String form required by Turbopack — JS functions can't cross to Rust.
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [["rehype-slug", {}]],
  },
});

export default withMDX(nextConfig);
