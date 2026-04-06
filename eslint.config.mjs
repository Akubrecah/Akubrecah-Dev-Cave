import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // Next.js defaults
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Public vendor bundles (PDF.js, WASM, coherentpdf — not our source)
    "public/**",
    // One-off test/utility scripts using CommonJS require()
    "test-html2pdf.js",
    "scripts/*.js",
    "lib/pdf/receipt-template.ts",
  ]),

  // ─── Global overrides ───────────────────────────────────────────────────────
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // `any` is unavoidable in WASM wrappers, PDF processors, and API routes.
      // Treat it as a warning so CI can surface new occurrences without blocking.
      "@typescript-eslint/no-explicit-any": "warn",

      // Unused vars: silences parameters/vars prefixed with `_`.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Empty interfaces used as extension points in PDF/WASM adapters.
      "@typescript-eslint/no-empty-object-type": "warn",

      // Anonymous default exports in utility files — warn, not error.
      "import/no-anonymous-default-export": "warn",

      // @ts-ignore is disallowed; @ts-expect-error is preferred.
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-ignore": "allow-with-description", "ts-expect-error": "allow-with-description" },
      ],

      // Always enforce const for non-reassigned variables.
      "prefer-const": "error",

      // react-compiler plugin omitted — plugin not installed.
      // Install eslint-plugin-react-compiler and re-enable when ready.
    },
  },
]);

export default eslintConfig;
