/* eslint-disable prettier/prettier */
module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "google"],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "prettier/prettier": "off",
    quotes: "off",
    "object-curly-spacing": ["error", "always"],
    "quote-props": ["error", "as-needed"],
    "no-undef": "off",
    "max-len": "off",
  },
  ignorePatterns: ["**/*.spec.*"],
};
