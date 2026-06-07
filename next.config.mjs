import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
import path from "path";

const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {
    resolve: {
      alias: {
        fs: false,
        path: false,
        crypto: false,
      },
    },
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
