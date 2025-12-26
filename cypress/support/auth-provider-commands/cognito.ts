const loginToCognito = (username: string, password: string) => {
  Cypress.log({
    displayName: "COGNITO LOGIN",
    message: [`Authenticating as ${username}`],
    autoEnd: false,
  });

  cy.visit("/");

  cy.contains("Sign in with Cognito").click();

  cy.origin(
    Cypress.env("COGNITO_CUSTOM_DOMAIN"),
    { args: { username, password } },
    ({ username, password }) => {
      cy.contains("Sign in with your email and password");
      cy.get('input[name="username"]:visible').type(username);
      cy.get('input[name="password"]:visible').type(password, { log: false });
      cy.get('input[name="signInSubmitButton"]:visible').click();
    },
  );
};

Cypress.Commands.add("loginByCognito", (username: string, password: string) => {
  cy.session(
    [`cognito`, username],
    () => {
      loginToCognito(username, password);
    },
    {
      validate() {
        cy.visit("/tasks");
        cy.contains("Logged in").should("be.visible");
      },
    },
  );
});
