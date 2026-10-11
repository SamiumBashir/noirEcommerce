import nextPlugin from "@next/eslint-plugin-next";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", ".git/**", "dist/**"],
  },
  nextPlugin.configs["core-web-vitals"],
  {
    rules: {
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
