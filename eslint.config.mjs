import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Underscore-prefixed args mean "intentionally unused" — common for
      // typed stubs and TS-style placeholder parameters.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // Long-form prose pages — disable the stylistic apostrophe escaping
    // so the source stays readable for content edits. JSX still escapes
    // values at render time, so this isn't a correctness or XSS concern.
    files: [
      "src/app/about/page.tsx",
      "src/app/privacy/page.tsx",
      "src/app/why-browser-based/page.tsx",
    ],
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
    "public/qpdf.js",
  ]),
]);

export default eslintConfig;
