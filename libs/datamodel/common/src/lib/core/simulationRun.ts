import { SimulationRunLogStatus } from './simulationRunLog';

export enum SimulationRunStatus {
  // The api has created the entry
  CREATED = 'CREATED',
  // The api has submitted the run and service has accepted
  QUEUED = 'QUEUED',
  // The service has starting the run
  RUNNING = 'RUNNING',
  // The simulation is finished running, and results are being created
  PROCESSING = 'PROCESSING',
  // The run has finished
  SUCCEEDED = 'SUCCEEDED',
  // The run has failed
  FAILED = 'FAILED',
}

export const SimulationStatusToSimulationLogStatus = (
  input: SimulationRunStatus,
): SimulationRunLogStatus => {
  switch (input) {
    case SimulationRunStatus.CREATED: {
      return SimulationRunLogStatus.RUNNING;
    }
    case SimulationRunStatus.QUEUED: {
      return SimulationRunLogStatus.QUEUED;
    }
    case SimulationRunStatus.FAILED: {
      return SimulationRunLogStatus.FAILED;
    }
    case SimulationRunStatus.PROCESSING: {
      return SimulationRunLogStatus.RUNNING;
    }
    case SimulationRunStatus.RUNNING: {
      return SimulationRunLogStatus.RUNNING;
    }
    case SimulationRunStatus.SUCCEEDED: {
      return SimulationRunLogStatus.SUCCEEDED;
    }
  }
};
