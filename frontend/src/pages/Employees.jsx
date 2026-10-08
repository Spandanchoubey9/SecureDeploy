import { useEffect, useState } from "react";
import {
  getEmployees,
  deleteEmployee,
} from "../services/api";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees();

      /*
       * Backend may return either:
       * { employees: [...] }
       * or directly [...]
       */
      const employeeList =
        data?.employees ||
        data?.data ||
        data ||
        [];

      setEmployees(
        Array.isArray(employeeList)
          ? employeeList
          : []
      );
    } catch (err) {
      console.error(
        "Employee loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load employees from SecureDeploy API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEmployee(id);

      await loadEmployees();
    } catch (err) {
      console.error(
        "Employee deletion error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete employee."
      );
    }
  };

  const departmentCount =
    new Set(
      employees
        .map((employee) => employee.department)
        .filter(Boolean)
    ).size;

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">
            SECUREDEPLOY / WORKFORCE
          </p>

          <h1>Employees</h1>
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

      <section className="hero-card">
        <div>
          <span className="hero-label">
            EMPLOYEE MANAGEMENT
          </span>

          <h2>
            Manage your workforce.
            <br />
            <span>Securely and centrally.</span>
          </h2>

          <p>
            Employee records are retrieved directly
            from the SecureDeploy PostgreSQL database
            through the protected REST API.
          </p>
        </div>

        <div className="pipeline-preview">
          <div className="pipeline-title">
            <span>DATA FLOW</span>

            <span className="running">
              ● Connected
            </span>
          </div>

          <div className="pipeline">
            <PipelineStep
              number="01"
              title="React"
              status="done"
            />

            <PipelineLine />

            <PipelineStep
              number="02"
              title="REST API"
              status="done"
            />

            <PipelineLine />

            <PipelineStep
              number="03"
              title="JWT"
              status="done"
            />

            <PipelineLine />

            <PipelineStep
              number="04"
              title="PostgreSQL"
              status="done"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="error-banner">
          <strong>
            Employee API Error
          </strong>

          <span>{error}</span>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          label="EMPLOYEES"
          value={
            loading
              ? "—"
              : employees.length
          }
          change="LIVE"
          description="PostgreSQL records"
        />

        <StatCard
          label="DEPARTMENTS"
          value={
            loading
              ? "—"
              : departmentCount
          }
          change="LIVE"
          description="active departments"
        />

        <StatCard
          label="DATABASE"
          value={
            loading
              ? "..."
              : error
              ? "OFFLINE"
              : "ONLINE"
          }
          change={
            error
              ? "ERROR"
              : "HEALTHY"
          }
          description="SecureDeploy DB"
        />

        <StatCard
          label="AUTHENTICATION"
          value="JWT"
          change="ACTIVE"
          description="Protected API"
        />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                EMPLOYEE DIRECTORY
              </span>

              <h3>
                Workforce Records
              </h3>
            </div>

            <button
              className="text-button"
              onClick={loadEmployees}
              disabled={loading}
            >
              {loading
                ? "Refreshing..."
                : "Refresh →"}
            </button>
          </div>

          <div className="deployment-list">
            {loading ? (
              <>
                <EmployeeSkeleton />
                <EmployeeSkeleton />
                <EmployeeSkeleton />
              </>
            ) : error ? (
              <div className="empty-state">
                Unable to retrieve employee
                records.
              </div>
            ) : employees.length === 0 ? (
              <div className="empty-state">
                No employee records found.
              </div>
            ) : (
              employees.map((employee) => (
                <EmployeeRow
                  key={employee.id}
                  employee={employee}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        <div className="panel infrastructure-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                ACCESS CONTROL
              </span>

              <h3>
                Security Model
              </h3>
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>
                Authentication
              </strong>

              <span>
                JSON Web Token
              </span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Active
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>
                Read Employees
              </strong>

              <span>
                ADMIN / MANAGER / EMPLOYEE
              </span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Allowed
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>
                Update Employees
              </strong>

              <span>
                ADMIN / MANAGER
              </span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Protected
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>
                Delete Employees
              </strong>

              <span>
                ADMIN only
              </span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Protected
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function EmployeeRow({
  employee,
  onDelete,
}) {
  return (
    <div className="deployment-row">
      <div className="deployment-icon success">
        ✓
      </div>

      <div className="deployment-info">
        <strong>
          {employee.name ||
            employee.full_name ||
            "Unnamed Employee"}
        </strong>

        <div>
          <span>
            {employee.email ||
              "No email"}
          </span>

          <span>•</span>

          <span>
            {employee.department ||
              "No department"}
          </span>
        </div>

        {employee.role && (
          <small className="activity-details">
            Role: {employee.role}
          </small>
        )}
      </div>

      <div className="deployment-status success">
        Active
      </div>
    </div>
  );
}

function EmployeeSkeleton() {
  return (
    <div className="deployment-row">
      <div className="deployment-icon success">
        ...
      </div>

      <div className="deployment-info">
        <strong>
          Loading employee...
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

        <small>
          {description}
        </small>
      </div>
    </div>
  );
}

export default Employees;