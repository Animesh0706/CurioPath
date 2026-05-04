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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="material-symbols-outlined spinner text-primary text-4xl">autorenew</span>
      </div>
    );
  }

  const completed = stats.progress.filter((p) => p.status === "COMPLETED").length;
  const inProgress = stats.progress.filter((p) => p.status === "IN_PROGRESS").length;

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <header className="mb-xl">
        <h2 className="font-display-xl text-display-xl text-on-surface mb-sm tracking-tighter">Welcome back, {user?.name}.</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Ready to continue your journey? You have {inProgress} resources currently in progress.
        </p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl">
        {/* Stat Card 1: Resources */}
        <div className="glass-card rounded-xl p-md transition-all duration-300 ease-out group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Total Resources</span>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
              <span className="material-symbols-outlined text-secondary">library_books</span>
            </div>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface">{stats.resources}</div>
          <div className="mt-xs flex items-center gap-2">
            <Link to="/resources" className="font-label-sm text-label-sm text-secondary hover:underline">Browse Resources →</Link>
          </div>
        </div>

        {/* Stat Card 2: Paths */}
        <div className="glass-card rounded-xl p-md transition-all duration-300 ease-out group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Learning Paths</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-primary">route</span>
            </div>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface">{stats.paths}</div>
          <div className="mt-xs flex items-center gap-2">
            <Link to="/paths" className="font-label-sm text-label-sm text-primary hover:underline">Explore Paths →</Link>
          </div>
        </div>

        {/* Stat Card 3: Completed */}
        <div className="glass-card rounded-xl p-md transition-all duration-300 ease-out group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Completed Items</span>
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center border border-tertiary/20 group-hover:bg-tertiary/20 transition-colors">
              <span className="material-symbols-outlined text-tertiary">check_circle</span>
            </div>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface">{completed}</div>
          <div className="mt-xs flex items-center gap-2">
            <div className="px-2 py-1 rounded-full bg-tertiary/10 border border-tertiary/20 font-label-sm text-label-sm text-tertiary">Great work!</div>
          </div>
        </div>
      </section>

      {/* Continue Learning Section (Only if they have something in progress) */}
      {inProgress > 0 && (
        <section className="mb-xl">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-gutter">Continue Learning</h3>
          <div className="glass-card rounded-xl p-lg relative overflow-hidden group hover:shadow-[0_0_20px_rgba(208,188,255,0.1)] transition-all duration-300">
            {/* Abstract Background Gradient for visual interest */}
            <div className="absolute -right-32 -top-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-lg items-start md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-sm">
                  <span className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 font-label-sm text-label-sm text-secondary">In Progress</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{inProgress} active resources</span>
                </div>
                <h4 className="font-headline-md text-headline-md text-on-surface mb-xs">Jump back into your curriculum</h4>
                <p className="font-body-md text-body-md text-on-surface-variant mb-md">You have unfinished resources waiting for you.</p>
              </div>
              
              <div className="shrink-0">
                <Link to="/paths" className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 transition-all duration-300">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  Resume Learning
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
