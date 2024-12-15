# Component Tests

## Styling

The `component-index.html` file is kept similar to the `public/index.html` to ensure styling of the components during
tests matches production. This is following the Cypress recommendations: https://docs.cypress.io/guides/component-testing/styling-components

## Cypress and Jest types conflicting

Cypress and Jest share certain function names, such as `expect`. To resolve this Cypress tests start with
a triple slash reference directive:

```typescript
/// <reference types="cypress" />
```

Read more: [Cypress Docs: How do I get TypeScript to recognize Cypress types and not Jest types?](https://docs.cypress.io/guides/component-testing/faq#How-do-I-get-TypeScript-to-recognize-Cypress-types-and-not-Jest-types)

## Cypress tests built along with components

Unfortunately Create-React-App which this project uses doesn't allow the tsconfig.json to be configured
per environment. So this means the Cypress component tests are built when you built the project.

The tree-shaking algorithm will then remove the artifacts from the final JS assets.

You can read more about this issue here: https://github.com/facebook/create-react-app/issues/6023
