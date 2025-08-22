import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable explicit any restriction
      "@typescript-eslint/no-explicit-any": "off",

      // Disable unused vars
      "@typescript-eslint/no-unused-vars": "off",

      // Disable unescaped entities (like ')
      "react/no-unescaped-entities": "off",

      // Disable Next.js img warning
      "@next/next/no-img-element": "off",

      // ✅ Disable hook exhaustive-deps warnings
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
