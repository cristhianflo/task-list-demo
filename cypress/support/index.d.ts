declare namespace Cypress {
  interface Chainable {
    loginByCognito(username: string, password: string): Chainable<void>;
  }
}
