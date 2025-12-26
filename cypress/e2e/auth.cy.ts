describe("Authentication Flow (AWS Cognito)", () => {
  beforeEach(() => {
    cy.task<{ username: string; password: string }>(
      "getCognitoCredentials",
    ).then(({ username, password }) => {
      cy.loginByCognito(username, password);
    });
  });

  it("Shows tasks page", () => {
    cy.visit("/tasks");
    cy.contains("Logged in").should("be.visible");
  });
});

describe("Logout Flow", () => {
  beforeEach(() => {
    cy.task<{ username: string; password: string }>(
      "getCognitoCredentials",
    ).then(({ username, password }) => {
      cy.loginByCognito(username, password);
    });
  });

  it("Can log out", () => {
    cy.visit("/tasks");
    cy.get("button").contains("Sign out").click();
    cy.contains("Sign in with Cognito").should("be.visible");
  });
});
