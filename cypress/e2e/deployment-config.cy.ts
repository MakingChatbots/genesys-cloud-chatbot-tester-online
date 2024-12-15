/// <reference types="cypress" />

describe("Deployment Config", () => {
  it("Start Test button only enabled if Deployment ID and Region provided", () => {
    cy.visit("http://localhost:5173/");

    // Neither populated = Button disabled
    cy.get("input[id='inputDeploymentId']").clear();
    cy.get("input[id='inputRegion']").clear();
    cy.get("button[id='run-tests']").should("be.disabled");

    // Only Deployment ID populated = Button disabled
    cy.get("input[id='inputDeploymentId']").type("1");
    cy.get("input[id='inputRegion']").clear();
    cy.get("button[id='run-tests']").should("be.disabled");

    // Only Region populated = Button disabled
    cy.get("input[id='inputDeploymentId']").clear();
    cy.get("input[id='inputRegion']").type("1");
    cy.get("button[id='run-tests']").should("be.disabled");

    // Both populated = Button enabled
    cy.get("input[id='inputDeploymentId']").clear();
    cy.get("input[id='inputRegion']").clear();

    cy.get("input[id='inputDeploymentId']").type("1");
    cy.get("input[id='inputRegion']").type("1");
    cy.get("button[id='run-tests']").should("be.enabled");
  });

  it("Deployment configuration can be hidden", () => {
    cy.clearAllLocalStorage();
    cy.visit("http://localhost:5173/");

    // Deployment ID
    cy.get("input[id='inputDeploymentId']").type("1");
    cy.get("input[id='inputDeploymentId']").should(
      "not.have.attr",
      "type",
      "password",
    );
    cy.get("button[id='hide-show-deployment-id']").click();
    cy.get("input[id='inputDeploymentId']").should(
      "have.attr",
      "type",
      "password",
    );

    // Region
    cy.get("input[id='inputRegion']").type("1");
    cy.get("input[id='inputRegion']").should(
      "not.have.attr",
      "type",
      "password",
    );
    cy.get("button[id='hide-show-region']").click();
    cy.get("input[id='inputRegion']").should("have.attr", "type", "password");

    cy.reload();

    // Resets after reload
    cy.get("input[id='inputRegion']").should(
      "not.have.attr",
      "type",
      "password",
    );
    cy.get("input[id='inputDeploymentId']").should(
      "not.have.attr",
      "type",
      "password",
    );
  });
});
