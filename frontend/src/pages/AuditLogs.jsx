import { useEffect, useState } from "react";
import axios from "axios";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(
          "/api/audit",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLogs(response.data.logs || []);
      } catch (error) {
        console.error(
          "Failed to load audit logs:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token]);

  return (
    <>
      {/* TOPBAR */}
      <header className="topbar">
        <div>
          <p className="eyebrow">
            SECUREDEPLOY / SECURITY
          </p>

          <h1>Audit Logs</h1>
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
            SECURITY & COMPLIANCE
          </span>

          <h2>
            Every important action
            <br />
            <span>should be traceable.</span>
          </h2>

          <p>
            Track authenticated activity across
            SecureDeploy with a centralized audit trail
            for accountability and security monitoring.
          </p>
        </div>

        <div className="pipeline-preview">
          <div className="pipeline-title">
            <span>AUDIT FLOW</span>

            <span className="running">
              ● Protected
            </span>
          </div>

          <div className="pipeline">
            <PipelineStep
              number="01"
              title="Request"
              status="done"
            />

            <PipelineLine />

            <PipelineStep
              number="02"
              title="JWT"
              status="done"
            />

            <PipelineLine />

            <PipelineStep
              number="03"
              title="Action"
              status="done"
            />

            <PipelineLine />

            <PipelineStep
              number="04"
              title="Audit DB"
              status="done"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-grid">
        <StatCard
          label="TOTAL ACTIONS"
          value={loading ? "—" : logs.length}
          change="TRACKED"
          description="system activity"
        />

        <StatCard
          label="SECURITY"
          value="ACTIVE"
          change="PROTECTED"
          description="audit monitoring"
        />

        <StatCard
          label="AUTHENTICATION"
          value="JWT"
          change="ENABLED"
          description="secured requests"
        />

        <StatCard
          label="DATABASE"
          value="ONLINE"
          change="POSTGRESQL"
          description="audit storage"
        />
      </section>

      {/* CONTENT */}
      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                SECURITY ACTIVITY
              </span>

              <h3>System Audit Trail</h3>
            </div>

            <span className="panel-count">
              {logs.length} events
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading audit activity...
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              No audit events found.
            </div>
          ) : (
            <div className="deployment-list">
              {logs.map((log) => (
                <div
                  className="deployment-row"
                  key={log.id}
                >
                  <div className="deployment-icon success">
                    ✓
                  </div>

                  <div className="deployment-info">
                    <strong>
                      {log.action} {log.resource}
                    </strong>

                    <div>
                      <span>
                        {log.details}
                      </span>
                    </div>
                  </div>

                  <div className="deployment-info">
                    <strong>
                      {log.user_name}
                    </strong>

                    <div>
                      <span>
                        {new Date(
                          log.created_at
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="deployment-status success">
                    Recorded
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel infrastructure-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                SECURITY MODEL
              </span>

              <h3>Audit Protection</h3>
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>Authentication</strong>
              <span>JSON Web Token</span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Enabled
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>Audit Storage</strong>
              <span>PostgreSQL</span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Online
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>Request Protection</strong>
              <span>Authenticated API</span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Active
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>Role Control</strong>
              <span>RBAC middleware</span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Active
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

export default AuditLogs;
