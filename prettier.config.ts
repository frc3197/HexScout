export default {
  plugins: ["prettier-plugin-svelte"],

  semi: true,
  singleQuote: false,
  trailingComma: "all",
  tabWidth: 2,

  overrides: [
    {
      files: "*.svelte",
      options: {
        parser: "svelte",
      },
    },
  ],
};
