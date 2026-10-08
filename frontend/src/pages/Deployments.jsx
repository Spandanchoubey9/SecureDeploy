import { useEffect, useState } from "react";
import {
  getDeployments,
  createDeployment,
} from "../services/api";

function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadDeployments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDeployments();

      setDeployments(data.deployments || []);
    } catch (err) {
      console.error(
        "Failed to load deployments:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load deployments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeployments();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Trigger deployment
  |--------------------------------------------------------------------------
  */

  const handleTriggerDeployment = async () => {
    try {
      setCreating(true);
      setError("");

      await createDeployment({
        branch: "main",
        commit_hash: "manual-trigger",
        commit_message:
          "Manual deployment triggered from SecureDeploy",
        environment: "production",
      });

      await loadDeployments();

    } catch (err) {
      console.error(
        "Deployment creation failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create deployment"
      );
    } finally {
      setCreating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Deployment statistics
  |--------------------------------------------------------------------------
  */

  const totalDeployments =
    deployments.length;

  const successfulDeployments =
    deployments.filter(
      (deployment) =>
        deployment.status === "SUCCESS"
    ).length;

  const failedDeployments =
    deployments.filter(
      (deployment) =>
        deployment.status === "FAILED"
    ).length;

  const successRate =
    totalDeployments > 0
      ? (
          (successfulDeployments /
            totalDeployments) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <>
      {/* TOPBAR */}

      <header className="topbar">
        <div>
          <p className="eyebrow">
            SECUREDEPLOY / PIPELINE
          </p>

          <h1>Deployments</h1>
        </div>

        <div className="topbar-actions">
          <div className="environment">
            <span className="status-dot"></span>
            Production
          </div>

          <div className="avatar">
            AU
          </div>
        </div>
      </header>

      {/* HERO */}

      <section className="hero-card">
        <div>
          <span className="hero-label">
            AUTOMATED DELIVERY
          </span>

          <h2>
            Ship changes with confidence.
            <br />
            <span>
              Every build. Every deployment.
            </span>
          </h2>

          <p>
            Monitor application builds,
            pipeline execution and deployment
            activity from one centralized
            control plane.
          </p>

          <button
            type="button"
            className="deploy-button"
            onClick={handleTriggerDeployment}
            disabled={creating}
          >
            <span>▶</span>

            {creating
              ? "Creating Deployment..."
              : "Trigger Deployment"}
          </button>
        </div>

        <div className="pipeline-preview">
          <div className="pipeline-title">
            <span>
              DEPLOYMENT PIPELINE
            </span>

            <span className="running">
              ● Ready
            </span>
          </div>

          <div className="pipeline">
            <PipelineStep
              number="01"
              title="Git Push"
              status="done"
            />

            <PipelineLine />

            <PipelineStep
              number="02"
              title="Jenkins"
              status="done"
            />

            <PipelineLine />

            <PipelineStep
              number="03"
              title="Build"
              status="running"
            />

            <PipelineLine />

            <PipelineStep
              number="04"
              title="Deploy AWS"
              status="waiting"
            />
          </div>
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div className="error-banner">
          <strong>
            Deployment error
          </strong>

          <span>{error}</span>
        </div>
      )}

      {/* STATS */}

      <section className="stats-grid">
        <StatCard
          label="TOTAL DEPLOYMENTS"
          value={
            loading
              ? "—"
              : totalDeployments
          }
          change="LIVE"
          description="PostgreSQL"
        />

        <StatCard
          label="SUCCESS RATE"
          value={
            loading
              ? "—"
              : `${successRate}%`
          }
          change={
            successfulDeployments > 0
              ? "Healthy"
              : "Waiting"
          }
          description="recorded deployments"
        />

        <StatCard
          label="FAILED"
          value={
            loading
              ? "—"
              : failedDeployments
          }
          change={
            failedDeployments > 0
              ? "Review"
              : "Healthy"
          }
          description="failed deployments"
        />

        <StatCard
          label="PIPELINE"
          value="READY"
          change="API"
          description="deployment controller"
        />
      </section>

      {/* CONTENT */}

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                PIPELINE ACTIVITY
              </span>

              <h3>
                Deployment History
              </h3>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={loadDeployments}
            >
              Refresh →
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading deployment history...
            </div>
          ) : deployments.length === 0 ? (
            <div className="empty-state">
              No deployments recorded yet.
            </div>
          ) : (
            <div className="deployment-list">
              {deployments.map(
                (deployment) => {
                  const successful =
                    deployment.status ===
                    "SUCCESS";

                  const failed =
                    deployment.status ===
                    "FAILED";

                  return (
                    <div
                      className="deployment-row"
                      key={deployment.id}
                    >
                      <div
                        className={`deployment-icon ${
                          successful
                            ? "success"
                            : failed
                            ? "failed"
                            : "success"
                        }`}
                      >
                        {successful
                          ? "✓"
                          : failed
                          ? "!"
                          : "●"}
                      </div>

                      <div className="deployment-info">
                        <strong>
                          {deployment.commit_message ||
                            "Deployment"}
                        </strong>

                        <div>
                          <span>
                            {deployment.branch}
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {deployment.commit_hash ||
                              "No commit"}
                          </span>
                        </div>

                        <small className="activity-details">
                          {deployment.environment}
                          {" • "}
                          {deployment.triggered_by_name ||
                            "System"}
                        </small>
                      </div>

                      <div className="deployment-status-container">
                        <div
                          className={`deployment-status ${
                            successful
                              ? "success"
                              : failed
                              ? "failed"
                              : "success"
                          }`}
                        >
                          {deployment.status}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* PIPELINE SIDE PANEL */}

        <div className="panel infrastructure-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                PIPELINE STATUS
              </span>

              <h3>
                Delivery System
              </h3>
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>
                Source Control
              </strong>

              <span>
                GitHub repository
              </span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Ready
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>
                Deployment API
              </strong>

              <span>
                SecureDeploy controller
              </span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Online
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>
                Jenkins CI/CD
              </strong>

              <span>
                Pipeline controller
              </span>
            </div>

            <div className="resource-status">
              Pending
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>
                AWS EC2
              </strong>

              <span>
                Production compute
              </span>
            </div>

            <div className="resource-status">
              Pending
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Pipeline components
|--------------------------------------------------------------------------
*/

function PipelineStep({
  number,
  title,
  status,
}) {
  return (
    <div
      className={`pipeline-step ${status}`}
    >
      <div className="step-number">
        {number}
      </div>

      <div className="step-title">
        {title}
      </div>
    </div>
  );
}

function PipelineLine() {
  return (
    <div className="pipeline-line"></div>
  );
}

function StatCard({
  label,
  value,
  change,
  description,
}) {
  return (
    <div className="stat-card">
      <span>{label}</span>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-footer">
        <strong>{change}</strong>

        <small>{description}</small>
      </div>
    </div>
  );
}

export default Deployments;