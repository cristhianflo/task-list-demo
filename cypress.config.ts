import { defineConfig } from "cypress";
require("dotenv").config();

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      on("task", {
        getCognitoCredentials() {
          const username = process.env.COGNITO_USERNAME;
          const password = process.env.COGNITO_PASSWORD;
          if (!username || !password) {
            throw new Error(
              "AWS_COGNITO_USERNAME and AWS_COGNITO_PASSWORD must be set",
            );
          }
          return { username, password };
        },
      });
      return config;
    },
  },
  env: {
    COGNITO_CUSTOM_DOMAIN: process.env.COGNITO_CUSTOM_DOMAIN,
  },
});
