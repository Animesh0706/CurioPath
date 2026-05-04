import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pathAPI } from "../api/pathAPI";
import useAuthStore from "../stores/authStore";

const PathsPage = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // ─── Create Form State ──────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [formError, setFormError] = useState("");

  // ─── Fetch Paths ────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ["paths", { page, search }],
    queryFn: () => pathAPI.getAll({ page, limit: 12, search: search || undefined }),
    select: (res) => res.data.data,
  });

  // ─── Create Mutation ────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (newPath) => pathAPI.create(newPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paths"] });
      setShowForm(false);
      setForm({ title: "", description: "" });
      setFormError("");
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || "Failed to create path");
    },
  });

  // ─── Delete Mutation ────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => pathAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paths"] });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const getGradientAndIcon = (index) => {
    const styles = [
      { bg: "from-[#2a0845] to-[#6441A5]", icon: "architecture", color: "text-primary" },
      { bg: "from-[#0f2027] via-[#203a43] to-[#2c5364]", icon: "data_object", color: "text-secondary" },
      { bg: "from-[#141E30] to-[#243B55]", icon: "neurology", color: "text-tertiary" },
      { bg: "from-[#3E5151] to-[#DECBA4]", icon: "database", color: "text-primary" },
    ];
    return styles[index % styles.length];
  };

  const isOwner = (path) => user && path.creatorId === user.id;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Header Section */}
      <header className="mb-xl">
        <h1 className="font-display-xl text-display-xl text-on-surface mb-xs tracking-tighter">Learning Paths</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Discover curated sequences of resources designed to master complex technical concepts. Built for deep learning and practical application.
        </p>
      </header>

      {/* Control Bar */}
      <section className="glass-card rounded-xl p-md mb-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-20">
        <div className="flex-1 w-full md:w-auto relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
          <input 
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-on-surface placeholder-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md" 
            placeholder="Search paths..." 
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        {isAuthenticated && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="w-full md:w-auto bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>{showForm ? "close" : "add"}</span>
            {showForm ? "Cancel" : "New Path"}
          </button>
        )}
      </section>

      {/* Create Form */}
      {showForm && (
        <section className="glass-card rounded-xl p-lg mb-lg border border-primary/20 animate-fade-in relative z-20">
          <h3 className="font-headline-md text-on-surface mb-md">Create Learning Path</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-md">
            {formError && <p className="text-error bg-error-container/20 p-3 rounded">{formError}</p>}
            
            <div className="input-wrapper mb-0">
              <input className="input-field" id="path-title" placeholder="Path Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <label className="floating-label font-body-md" htmlFor="path-title">Path Title</label>
            </div>

            <div className="input-wrapper mb-0 h-full">
              <textarea 
                className="input-field min-h-[100px] resize-y" 
                id="path-desc" 
                placeholder="Description" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                required 
              />
              <label className="floating-label font-body-md" htmlFor="path-desc">Description</label>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={createMutation.isPending}
                className="bg-primary text-on-primary py-2 px-6 rounded-lg font-label-md hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create Path"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Path List */}
      <section className="space-y-md relative z-10">
        {isLoading && <div className="text-center py-10"><span className="material-symbols-outlined spinner text-4xl text-primary">autorenew</span></div>}
        {error && <div className="text-center py-10 text-error">Error loading paths.</div>}
        {data?.paths?.length === 0 && <div className="text-center py-10 text-on-surface-variant">No learning paths found.</div>}

        {data?.paths?.map((path, index) => {
          const style = getGradientAndIcon(index);
          return (
            <article 
              key={path.id} 
              onClick={() => navigate(`/paths/${path.id}`)}
              className="glass-card rounded-xl p-md flex flex-col sm:flex-row gap-6 cursor-pointer hover:shadow-[0_0_20px_rgba(208,188,255,0.1)] transition-all group"
            >
              <div className={`w-full sm:w-48 h-32 rounded-lg bg-gradient-to-br ${style.bg} flex-shrink-0 relative overflow-hidden flex items-center justify-center group-hover:shadow-lg transition-all`}>
                <span className="material-symbols-outlined text-white/50 text-5xl group-hover:scale-110 transition-transform duration-500">{style.icon}</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">{path.title}</h2>
                  <div className="flex gap-2">
                    <span className="bg-primary-container/20 text-primary-fixed-dim px-3 py-1 rounded-full font-label-sm text-label-sm border border-primary/20 whitespace-nowrap flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">library_books</span> {path.resources?.length || 0} Resources
                    </span>
                    {isOwner(path) && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(path.id); }}
                        className="p-1 px-2 rounded-full bg-error-container/80 text-on-error-container hover:bg-error hover:text-on-error transition-colors ml-2"
                        title="Delete path"
                      >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>delete</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-2">{path.description}</p>
                
                <div className="flex items-center gap-3 mt-auto">
                  <span className="w-6 h-6 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-xs text-on-surface-variant">
                    {path.creator?.name ? path.creator.name.charAt(0).toUpperCase() : "?"}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">Curated by <span className="text-on-surface">{path.creator?.name || "Unknown"}</span></span>
                  <div className="w-1 h-1 rounded-full bg-outline-variant mx-2"></div>
                  <span className={`font-label-sm text-label-sm ${style.color} flex items-center gap-1`}>
                    <span className="material-symbols-outlined text-[14px]">bolt</span> View Journey
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-xl">
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(page - 1)}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="font-label-md text-on-surface-variant">
            Page <span className="text-on-surface font-bold">{data.pagination.page}</span> of {data.pagination.totalPages}
          </span>
          <button 
            disabled={page >= data.pagination.totalPages} 
            onClick={() => setPage(page + 1)}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PathsPage;
