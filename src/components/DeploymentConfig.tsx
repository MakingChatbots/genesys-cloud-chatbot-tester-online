import { useState } from "react";

interface Props {
  deploymentId: string;
  region: string;
  setDeploymentId: (deploymentId: string) => void;
  setRegion: (region: string) => void;
}

export function DeploymentConfig({
  deploymentId,
  region,
  setDeploymentId,
  setRegion,
}: Props) {
  const [showDeploymentId, setShowDeploymentId] = useState(true);
  const [showRegion, setShowRegion] = useState(true);

  return (
    <div className="row">
      <div className="col-md-7">
        <label htmlFor="inputDeploymentId" className="form-label">
          Deployment ID
        </label>
        <div className="input-group">
          <input
            type={showDeploymentId ? "text" : "password"}
            className="form-control"
            id="inputDeploymentId"
            aria-label="Deployment ID"
            aria-describedby="hide-show-deployment-id"
            value={deploymentId}
            onChange={(e) => setDeploymentId(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary border"
            type="button"
            id="hide-show-deployment-id"
            onClick={() => setShowDeploymentId((value) => !value)}
          >
            {showDeploymentId && <i className="bi bi-eye-slash"></i>}
            {!showDeploymentId && <i className="bi bi-eye"></i>}
          </button>
        </div>
      </div>
      <div className="col-md-5">
        <label htmlFor="inputRegion" className="form-label">
          Region
        </label>
        <div className="input-group">
          <input
            type={showRegion ? "text" : "password"}
            className="form-control"
            id="inputRegion"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary border"
            type="button"
            id="hide-show-region"
            onClick={() => setShowRegion((value) => !value)}
          >
            {showRegion && <i className="bi bi-eye-slash"></i>}
            {!showRegion && <i className="bi bi-eye"></i>}
          </button>
        </div>
      </div>
    </div>
  );
}
