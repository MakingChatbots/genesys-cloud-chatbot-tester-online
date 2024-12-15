import { Step } from "../../stepDefinitions";
import { validateObject } from "./validateTest.ts";

interface V1TestDefinition {
  schemaVersion: 1;
  deploymentConfig?: {
    deploymentId?: string;
    region?: string;
  };
  steps: Step[];
}

interface DecodeResultSuccess {
  decoded: true;
  testDefinition: V1TestDefinition;
}

interface DecodeResultFailure {
  decoded: false;
}

export type DecodeResult = DecodeResultSuccess | DecodeResultFailure;

interface UrlDataEncoder {
  appendToURL(baseURL: string, steps: V1TestDefinition): string;
  decode(dataURI: string): DecodeResult;
}

export class TestEncoderV1 implements UrlDataEncoder {
  private static QueryParamKey = "tests";

  private encode(steps: V1TestDefinition): string {
    const jsonString = JSON.stringify(steps); // Convert steps to JSON
    const base64String = btoa(jsonString); // Encode JSON to Base64
    return `data:application/json;base64,${base64String}`;
  }

  public decode(dataURI: string): DecodeResult {
    if (!dataURI.startsWith("data:application/json;base64,")) {
      throw new Error("Invalid Data URI format.");
    }

    const base64String = dataURI.split(",")[1];
    const jsonString = atob(base64String);
    const parseOutput = JSON.parse(jsonString);
    if (validateObject(parseOutput)) {
      return {
        decoded: true,
        testDefinition: parseOutput,
      };
    }

    return {
      decoded: false,
    };
  }

  public appendToURL(baseURL: string, steps: V1TestDefinition): string {
    const encodedData = encodeURIComponent(this.encode(steps));
    const separator = baseURL.includes("?") ? "&" : "?";
    return `${baseURL}${separator}${TestEncoderV1.QueryParamKey}=${encodedData}`;
  }
}
