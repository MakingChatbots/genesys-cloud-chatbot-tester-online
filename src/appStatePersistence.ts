import { Step } from './stepDefinitions.ts';


export function appStatePersistence(storage: Storage) {
  return {
    saveDeploymentId(
      deploymentId: string
    ): void {
      try {
        storage.setItem('deployment_id_v1', deploymentId);
      } catch (error) {
        console.error(`Error saving deployment_id_v1. Reason: ${error}`);
      }
    },
    readDeploymentId(): string | null {
      try {
        const deploymentId = storage.getItem('deployment_id_v1');
        return deploymentId ? deploymentId : null;
      } catch (error) {
        console.error(
          `Error reading deployment_id_v1. Reason: ${error}`
        );
        return null;
      }
    },
    saveRegion(
      region: string
    ): void {
      try {
        storage.setItem('region_v1', region);
      } catch (error) {
        console.error(`Error saving region_v1. Reason: ${error}`);
      }
    },
    readRegion(): string | null {
      try {
        const region = storage.getItem('region_v1');
        return region ? region : null;
      } catch (error) {
        console.error(
          `Error reading region_v1. Reason: ${error}`
        );
        return null;
      }
    },
    saveTestSteps(steps: Step[]): void {
      try {
        storage.setItem('test_steps_v1', JSON.stringify(steps));
      } catch (error) {
        console.error(
          `Error saving test_steps_v1. Reason: ${error}`
        );
      }
    },
    readTestSteps(defaultSteps: Step[]): Step[] {
      const steps = storage.getItem('test_steps_v1');
      if (!steps) return defaultSteps;
      try {
        return JSON.parse(steps);
      } catch (error) {
        console.error(
          `Error reading test_steps_v1. Reason: ${error}`
        );
        return [];
      }
    }
  };
}

