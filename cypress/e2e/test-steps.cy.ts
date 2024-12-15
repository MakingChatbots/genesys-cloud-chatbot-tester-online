/// <reference types="cypress" />

describe("Test Steps", () => {
  it("Add steps added", () => {
    cy.visit("http://localhost:5173/");

    cy.get("button[id='add-step']").click();

    // Add Say Step
    cy.get("select[id='add-step-type']").select("say");

    cy.get("button[id='add-step-action']").should("be.disabled");

    const testSay = `Test${Date.now()}`;
    cy.get("input[id='add-say-input']").type(
      testSay,
      { delay: 0 }, // Necessary otherwise full number isn't printing for some reason
    );

    cy.get("input[id='add-say-input']").should("have.value", testSay);

    cy.get("button[id='add-step-action']").click();

    cy.get("#test-steps-list li")
      .should("exist") // Ensure there are list items
      .then((listItems) => {
        expect(listItems.last().text()).to.contain(testSay);
      });

    cy.get("div[id='addStepModal']").should("not.be.visible");

    // Add Wait for Replying Step
    cy.get("button[id='add-step']").click();
    cy.get("select[id='add-step-type']").select("waitForReplyContaining");

    cy.get("button[id='add-step-action']").should("be.disabled");

    const testWaitForReplyContaining = `Test${Date.now()}`;
    cy.get("input[id='whatToWaitForInput']").type(
      testWaitForReplyContaining,
      { delay: 0 }, // Necessary otherwise full number isn't printing for some reason
    );

    cy.get("input[id='whatToWaitForInput']").should(
      "have.value",
      testWaitForReplyContaining,
    );

    cy.get("button[id='add-step-action']").click();

    cy.get("#test-steps-list li")
      .should("exist") // Ensure there are list items
      .then((listItems) => {
        expect(listItems.last().text()).to.contain(testWaitForReplyContaining);
      });

    cy.get("div[id='addStepModal']").should("not.be.visible");
  });
});
