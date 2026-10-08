function Infrastructure() {
  const resources = [
    {
      name: "PostgreSQL Database",
      type: "Database",
      status: "Healthy",
      detail: "SecureDeploy DB",
    },
    {
      name: "SecureDeploy API",
      type: "Application",
      status: "Online",
      detail: "Node.js / Express",
    },
    {
      name: "Jenkins CI/CD",
      type: "Pipeline Controller",
      status: "Pending",
      detail: "Automation Server",
    },
    {
      name: "AWS EC2",
      type: "Compute",
      status: "Pending",
      detail: "Production Server",
    },
  ];

  const healthyResources = resources.filter(
    (resource) =>
      resource.status === "Healthy" ||
      resource.status === "Online"
  ).length;

  return (
    <>
      {/* TOPBAR */}
      <header className="topbar">
        <div>
          <p className="eyebrow">
            SECUREDEPLOY / INFRASTRUCTURE
          </p>

          <h1>Infrastructure</h1>
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
            CLOUD INFRASTRUCTURE
          </span>

          <h2>
            Know what powers
            <br />
            <span>your deployment platform.</span>
          </h2>

          <p>
            Monitor the services, databases,
            automation systems and compute resources
            that support SecureDeploy.
          </p>
        </div>

        <div className="pipeline-preview">
          <div className="pipeline-title">
            <span>INFRASTRUCTURE FLOW</span>

            <span className="running">
              ● Monitoring
            </span>
          </div>

          <div className="pipeline">
            <PipelineStep
              number="01"
              title="Database"
              status="done"
            />

            <PipelineLine />

            <PipelineStep
              number="02"
              title="API"
              status="done"
            />

            <PipelineLine />

            <PipelineStep
              number="03"
              title="Jenkins"
              status="waiting"
            />

            <PipelineLine />

            <PipelineStep
              number="04"
              title="AWS EC2"
              status="waiting"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-grid">
        <StatCard
          label="ACTIVE SERVICES"
          value={healthyResources}
          change="Healthy"
          description="currently running"
        />

        <StatCard
          label="AWS REGION"
          value="us-east-1"
          change="Production"
          description="target region"
        />

        <StatCard
          label="CONTAINERIZED"
          value="1"
          change="Docker"
          description="services"
        />

        <StatCard
          label="DEPLOYMENT MODE"
          value="AUTO"
          change="CI/CD"
          description="enabled later"
        />
      </section>

      {/* CONTENT */}
      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                SYSTEM
              </span>

              <h3>
                Infrastructure Resources
              </h3>
            </div>

            <span className="panel-count">
              {resources.length} resources
            </span>
          </div>

          <div className="deployment-list">
            {resources.map((resource) => {
              const healthy =
                resource.status === "Healthy" ||
                resource.status === "Online";

              return (
                <div
                  className="deployment-row"
                  key={resource.name}
                >
                  <div
                    className={`deployment-icon ${
                      healthy
                        ? "success"
                        : "failed"
                    }`}
                  >
                    {healthy ? "✓" : "!"}
                  </div>

                  <div className="deployment-info">
                    <strong>
                      {resource.name}
                    </strong>

                    <div>
                      <span>
                        {resource.type}
                      </span>

                      <span>•</span>

                      <span>
                        {resource.detail}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`deployment-status ${
                      healthy
                        ? "success"
                        : "failed"
                    }`}
                  >
                    {resource.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel infrastructure-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                ENVIRONMENT
              </span>

              <h3>
                Deployment Configuration
              </h3>
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>Environment</strong>
              <span>Production</span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Active
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>Region</strong>
              <span>US East - N. Virginia</span>
            </div>

            <div className="resource-status">
              us-east-1
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>Container Runtime</strong>
              <span>Docker</span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Ready
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>Automation</strong>
              <span>Jenkins CI/CD</span>
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

export default Infrastructure;