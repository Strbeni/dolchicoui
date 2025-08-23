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
      // 🚫 Disable unused variables / args
      "@typescript-eslint/no-unused-vars": "off",

      // 🚫 Disable explicit any restriction
      "@typescript-eslint/no-explicit-any": "off",

      // 🚫 Disable unescaped entities warning
      "react/no-unescaped-entities": "off",

      // 🚫 Disable Next.js <img> warning
      "@next/next/no-img-element": "off",

      // 🚫 Disable exhaustive-deps hook rule
      "react-hooks/exhaustive-deps": "off",

      // 🚫 Turn off *everything else*
      "all": "off",
    },
  },
];

export default eslintConfig;
