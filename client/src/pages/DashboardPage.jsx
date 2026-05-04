import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { progressAPI } from "../api/progressAPI";
import { resourceAPI } from "../api/resourceAPI";
import { pathAPI } from "../api/pathAPI";

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({ resources: 0, paths: 0, progress: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [resourcesRes, pathsRes, progressRes] = await Promise.all([
          resourceAPI.getAll({ limit: 1 }),
          pathAPI.getAll({ limit: 1 }),
          progressAPI.getAll(),
        ]);

        setStats({
          resources: resourcesRes.data.data.pagination.total,
          paths: pathsRes.data.data.pagination.total,
          progress: progressRes.data.data.progress,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  const completed = stats.progress.filter((p) => p.status === "COMPLETED").length;
  const inProgress = stats.progress.filter((p) => p.status === "IN_PROGRESS").length;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, <strong>{user?.name}</strong>!</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", margin: "1.5rem 0" }}>
        <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>{stats.resources}</h3>
          <p>Total Resources</p>
        </div>
        <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>{stats.paths}</h3>
          <p>Learning Paths</p>
        </div>
        <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>{completed}</h3>
          <p>Completed</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <Link to="/resources">
          <button>Browse Resources</button>
        </Link>
        <Link to="/paths">
          <button>Browse Paths</button>
        </Link>
      </div>

      {inProgress > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3>{inProgress} resource(s) in progress</h3>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
