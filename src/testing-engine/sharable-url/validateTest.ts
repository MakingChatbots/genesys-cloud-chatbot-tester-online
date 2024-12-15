export function validateObject(obj: any): boolean {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return false;
  }

  const isNumber = (value: any) => typeof value === "number";
  const isString = (value: any) => typeof value === "string";
  const isObject = (value: any) =>
    typeof value === "object" && value !== null && !Array.isArray(value);
  const isArray = (value: any) => Array.isArray(value);

  const validateIdentifiableStep = (step: any) => {
    return isObject(step) && isNumber(step.id);
  };

  const validateWaitForReplyContainingStep = (step: any) => {
    return (
      validateIdentifiableStep(step) &&
      step.testStepType === "waitForReplyContaining" &&
      isObject(step.details) &&
      isString(step.details.expectedReplyText)
    );
  };

  const validateSayStep = (step: any) => {
    return (
      validateIdentifiableStep(step) &&
      step.testStepType === "say" &&
      isObject(step.details) &&
      isString(step.details.sayText)
    );
  };

  const validateStep = (step: any) => {
    return validateWaitForReplyContainingStep(step) || validateSayStep(step);
  };

  const validateDeploymentConfig = (config: any) => {
    return (
      isObject(config) &&
      (config.deploymentId === undefined || isString(config.deploymentId)) &&
      (config.region === undefined || isString(config.region))
    );
  };

  const validateV1TestDefinition = (definition: any) => {
    return (
      isObject(definition) &&
      definition.schemaVersion === 1 &&
      (definition.deploymentConfig === undefined ||
        validateDeploymentConfig(definition.deploymentConfig)) &&
      isArray(definition.steps) &&
      definition.steps.every(validateStep)
    );
  };

  return validateV1TestDefinition(obj);
}
