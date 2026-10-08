import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";

import Layout from "./components/Layout";

import Deployments from "./pages/Deployments";
import Infrastructure from "./pages/Infrastructure";
import Employees from "./pages/Employees";
import AuditLogs from "./pages/AuditLogs";

import { getDashboardStats } from "./services/api";


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboardStats();

        setStats(data);
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to connect to SecureDeploy API"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    return new Date(timestamp).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* TOP BAR */}

      <header className="topbar">
        <div>
          <p className="eyebrow">
            SECUREDEPLOY / OVERVIEW
          </p>

          <h1>Deployment Dashboard</h1>
        </div>

        <div className="topbar-actions">
          <div className="environment">
            <span className="status-dot"></span>
            Production
          </div>

          <div className="avatar">AU</div>
        </div>
      </header>


      {/* HERO */}

      <section className="hero-card">

        <div>
          <span className="hero-label">
            AUTOMATED DELIVERY
          </span>

          <h2>
            Deploy with confidence.
            <br />
            <span>Every commit. Automatically.</span>
          </h2>

          <p>
            SecureDeploy connects GitHub, Jenkins and your AWS
            infrastructure into one automated deployment workflow.
          </p>

          <button className="deploy-button">
            <span>▶</span>
            Trigger Deployment
          </button>
        </div>


        <div className="pipeline-preview">

          <div className="pipeline-title">
            <span>LIVE PIPELINE</span>
            <span className="running">● Running</span>
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
          <strong>Dashboard connection error</strong>
          <span>{error}</span>
        </div>
      )}


      {/* STATS */}

      <section className="stats-grid">

        <StatCard
          label="EMPLOYEES"
          value={
            loading
              ? "—"
              : stats?.totalEmployees ?? 0
          }
          change="LIVE"
          description="PostgreSQL"
        />

        <StatCard
          label="DEPARTMENTS"
          value={
            loading
              ? "—"
              : stats?.totalDepartments ?? 0
          }
          change="LIVE"
          description="current departments"
        />

        <StatCard
          label="AUDIT ACTIONS"
          value={
            loading
              ? "—"
              : stats?.totalActions ?? 0
          }
          change="TRACKED"
          description="system activity"
        />

        <StatCard
          label="API STATUS"
          value={
            loading
              ? "..."
              : error
              ? "OFFLINE"
              : "ONLINE"
          }
          change={error ? "ERROR" : "HEALTHY"}
          description="SecureDeploy API"
        />

      </section>


      {/* CONTENT */}

      <section className="content-grid">

        {/* RECENT ACTIVITY */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <span className="eyebrow">
                RECENT ACTIVITY
              </span>

              <h3>System Activity</h3>
            </div>

            <button className="text-button">
              View all →
            </button>

          </div>


          <div className="deployment-list">

            {loading ? (

              <>
                <ActivitySkeleton />
                <ActivitySkeleton />
                <ActivitySkeleton />
              </>

            ) : stats?.recentActivity?.length > 0 ? (

              stats.recentActivity.map((activity) => (
                <Activity
                  key={activity.id}
                  action={activity.action}
                  resource={activity.resource}
                  details={activity.details}
                  user={activity.user_name}
                  time={formatTime(activity.created_at)}
                />
              ))

            ) : (

              <div className="empty-state">
                No recent activity
              </div>

            )}

          </div>

        </div>


        {/* DATABASE / SYSTEM INFORMATION */}

        <div className="panel infrastructure-panel">

          <div className="panel-header">

            <div>
              <span className="eyebrow">
                SYSTEM
              </span>

              <h3>Infrastructure</h3>
            </div>

          </div>


          <div className="resource">

            <div>
              <strong>
                PostgreSQL Database
              </strong>

              <span>
                SecureDeploy DB
              </span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>

              {loading
                ? "Checking"
                : "Healthy"}
            </div>

          </div>


          <div className="resource">

            <div>
              <strong>
                SecureDeploy API
              </strong>

              <span>
                Node.js / Express
              </span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>

              {error
                ? "Offline"
                : "Online"}
            </div>

          </div>


          <div className="resource">

            <div>
              <strong>
                Authentication
              </strong>

              <span>
                JWT / RBAC
              </span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>

              Protected
            </div>

          </div>


          {/* DEPARTMENT SUMMARY */}

          <div className="department-summary">

            <span className="eyebrow">
              DEPARTMENTS
            </span>


            {!loading &&
            stats?.departmentDistribution?.length > 0 ? (

              stats.departmentDistribution.map(
                (department) => (

                  <div
                    className="department-row"
                    key={department.department}
                  >

                    <span>
                      {department.department}
                    </span>

                    <strong>
                      {department.count}
                    </strong>

                  </div>

                )
              )

            ) : (

              <div className="department-empty">

                {loading
                  ? "Loading..."
                  : "No departments found"}

              </div>

            )}

          </div>

        </div>

      </section>

    </>
  );
}


/* =========================================================
   PIPELINE STEP
========================================================= */

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


/* =========================================================
   PIPELINE LINE
========================================================= */

function PipelineLine() {
  return (
    <div className="pipeline-line"></div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

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


/* =========================================================
   ACTIVITY
========================================================= */

function Activity({
  action,
  resource,
  details,
  user,
  time,
}) {
  const isUpdate = action === "UPDATE";

  return (
    <div className="deployment-row">

      <div
        className={`deployment-icon ${
          isUpdate ? "success" : "success"
        }`}
      >
        {isUpdate ? "↻" : "✓"}
      </div>


      <div className="deployment-info">

        <strong>
          {action} {resource}
        </strong>

        <div>

          <span>
            {user || "System"}
          </span>

          <span>•</span>

          <span>
            {time}
          </span>

        </div>

        <small className="activity-details">
          {details}
        </small>

      </div>


      <div className="deployment-status success">
        Recorded
      </div>

    </div>
  );
}


/* =========================================================
   LOADING SKELETON
========================================================= */

function ActivitySkeleton() {
  return (
    <div className="deployment-row">

      <div className="deployment-icon success">
        ...
      </div>

      <div className="deployment-info">

        <strong>
          Loading activity...
        </strong>

        <div>
          <span>
            Fetching PostgreSQL data
          </span>
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   APP / ROUTING
========================================================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* SHARED LAYOUT */}

        <Route element={<Layout />}>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/deployments"
            element={<Deployments />}
          />

          <Route
            path="/infrastructure"
            element={<Infrastructure />}
          />

          <Route
            path="/employees"
            element={<Employees />}
          />

          <Route
            path="/audit-logs"
            element={<AuditLogs />}
          />

        </Route>


        {/* FALLBACK */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;