import { validateObject } from "./validateTest.ts";
import { describe, test, expect } from "vitest";

describe("validateObject", () => {
  test("validates a correct V1TestDefinition object", () => {
    const validObject = {
      schemaVersion: 1,
      deploymentConfig: {
        deploymentId: "abc123",
        region: "test-region",
      },
      steps: [
        {
          id: 1,
          testStepType: "say",
          details: {
            sayText: "Hello!",
          },
        },
        {
          id: 2,
          testStepType: "waitForReplyContaining",
          details: {
            expectedReplyText: "Hi",
          },
        },
      ],
    };

    expect(validateObject(validObject)).toBe(true);
  });

  test("rejects an object with missing schemaVersion", () => {
    const invalidObject = {
      deploymentConfig: {
        deploymentId: "abc123",
        region: "test-region",
      },
      steps: [],
    };

    expect(validateObject(invalidObject)).toBe(false);
  });

  test("rejects an object with invalid step", () => {
    const invalidObject = {
      schemaVersion: 1,
      steps: [
        {
          id: 1,
          testStepType: "unknown",
          details: {},
        },
      ],
    };

    expect(validateObject(invalidObject)).toBe(false);
  });

  test("validates an object with optional deploymentConfig", () => {
    const validObject = {
      schemaVersion: 1,
      steps: [
        {
          id: 1,
          testStepType: "say",
          details: {
            sayText: "Hello!",
          },
        },
      ],
    };

    expect(validateObject(validObject)).toBe(true);
  });

  test("rejects an object with invalid deploymentConfig", () => {
    const invalidObject = {
      schemaVersion: 1,
      deploymentConfig: {
        deploymentId: 12345,
        region: "test-region",
      },
      steps: [
        {
          id: 1,
          testStepType: "say",
          details: {
            sayText: "Hello!",
          },
        },
      ],
    };

    expect(validateObject(invalidObject)).toBe(false);
  });
});
