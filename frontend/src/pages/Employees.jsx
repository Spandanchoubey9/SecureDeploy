import { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  deleteEmployee,
} from "../services/api";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    salary: "",
  });

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees();
      const employeeList =
        data?.employees || data?.data || data || [];

      setEmployees(
        Array.isArray(employeeList) ? employeeList : []
      );
    } catch (err) {
      console.error("Employee loading error:", err);

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

  const handleAddEmployee = async (event) => {
    event.preventDefault();

    setSaving(true);
    setFormMessage("");
    setError("");

    try {
      await createEmployee({
        ...formData,
        salary:
          formData.salary === ""
            ? null
            : Number(formData.salary),
      });

      setFormMessage("Employee added successfully.");

      setFormData({
        name: "",
        email: "",
        department: "",
        position: "",
        salary: "",
      });

      setShowAddForm(false);
      await loadEmployees();
    } catch (err) {
      console.error("Employee creation error:", err);

      setFormMessage(
        err.response?.data?.message ||
          "Unable to add employee. Check your permissions and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    try {
      await deleteEmployee(id);
      await loadEmployees();
    } catch (err) {
      console.error("Employee deletion error:", err);

      window.alert(
        err.response?.data?.message ||
          "Unable to delete employee."
      );
    }
  };

  const departmentCount = new Set(
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

          <div className="avatar">AU</div>
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
          <strong>Employee API Error</strong>
          <span>{error}</span>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          label="EMPLOYEES"
          value={loading ? "—" : employees.length}
          change="LIVE"
          description="PostgreSQL records"
        />

        <StatCard
          label="DEPARTMENTS"
          value={loading ? "—" : departmentCount}
          change="LIVE"
          description="active departments"
        />

        <StatCard
          label="DATABASE"
          value={
            loading
              ? "…"
              : error
                ? "OFFLINE"
                : "ONLINE"
          }
          change={error ? "ERROR" : "HEALTHY"}
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
              <h3>Workforce Records</h3>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={loadEmployees}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh →"}
            </button>
          </div>

          {/* Add Employee interface */}
          <div style={{ margin: "16px 0" }}>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setShowAddForm((current) => !current);
                setFormMessage("");
              }}
              aria-expanded={showAddForm}
            >
              {showAddForm
                ? "Cancel"
                : "+ Add Employee"}
            </button>

            {formMessage && (
              <p
                role="status"
                style={{ marginTop: 10 }}
              >
                {formMessage}
              </p>
            )}

            {showAddForm && (
              <form
                onSubmit={handleAddEmployee}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                  marginTop: 16,
                  padding: 20,
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                }}
              >
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      name: event.target.value,
                    })
                  }
                  required
                />

                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      email: event.target.value,
                    })
                  }
                  required
                />

                <input
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      department: event.target.value,
                    })
                  }
                  required
                />

                <input
                  name="position"
                  placeholder="Position"
                  value={formData.position}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      position: event.target.value,
                    })
                  }
                  required
                />

                <input
                  name="salary"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Salary (optional)"
                  value={formData.salary}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      salary: event.target.value,
                    })
                  }
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <button
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Employee"}
                  </button>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      setShowAddForm(false)
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Employee directory */}
          <div className="deployment-list">
            {loading ? (
              <>
                <EmployeeSkeleton />
                <EmployeeSkeleton />
                <EmployeeSkeleton />
              </>
            ) : error ? (
              <div className="empty-state">
                Unable to retrieve employee records.
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
              <h3>Security Model</h3>
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>Authentication</strong>
              <span>JSON Web Token</span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Active
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>Read Employees</strong>
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
              <strong>Update Employees</strong>
              <span>ADMIN / MANAGER</span>
            </div>

            <div className="resource-status">
              <span className="status-dot"></span>
              Protected
            </div>
          </div>

          <div className="resource">
            <div>
              <strong>Delete Employees</strong>
              <span>ADMIN only</span>
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

function EmployeeRow({ employee, onDelete }) {
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
            {employee.email || "No email"}
          </span>

          <span>•</span>

          <span>
            {employee.department || "No department"}
          </span>
        </div>

        {employee.position && (
          <small className="activity-details">
            Position: {employee.position}
          </small>
        )}
      </div>

      <div className="deployment-status success">
        Active
      </div>

      <button
        type="button"
        className="text-button"
        onClick={() => onDelete(employee.id)}
        aria-label={`Delete ${
          employee.name || "employee"
        }`}
      >
        Delete
      </button>
    </div>
  );
}

function EmployeeSkeleton() {
  return (
    <div className="deployment-row">
      <div className="deployment-icon success">
        …
      </div>

      <div className="deployment-info">
        <strong>Loading employee...</strong>

        <div>
          <span>Fetching PostgreSQL data</span>
        </div>
      </div>
    </div>
  );
}

function PipelineStep({ number, title, status }) {
  return (
    <div className={`pipeline-step ${status}`}>
      <div className="step-number">{number}</div>
      <div className="step-title">{title}</div>
    </div>
  );
}

function PipelineLine() {
  return <div className="pipeline-line"></div>;
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

      <div className="stat-value">{value}</div>

      <div className="stat-footer">
        <strong>{change}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}

export default Employees;