import { NavLink, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">S</div>

          <div>
            <h2>SecureDeploy</h2>
            <span>Deployment Control</span>
          </div>
        </div>

        <nav className="navigation">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/deployments"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Deployments
          </NavLink>

          <NavLink
            to="/infrastructure"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Infrastructure
          </NavLink>

          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Employees
          </NavLink>

          <NavLink
            to="/audit-logs"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Audit Logs
          </NavLink>

        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>

            <div>
              <strong>System Operational</strong>
              <small>API connected</small>
            </div>
          </div>
        </div>

      </aside>

      {/* PAGE CONTENT */}
      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;