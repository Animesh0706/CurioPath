import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { resourceAPI } from "../api/resourceAPI";
import useAuthStore from "../stores/authStore";

const ResourcesPage = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  // ─── Filter State ───────────────────────────────────
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  // ─── Create Form State ──────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", type: "ARTICLE", description: "" });
  const [formError, setFormError] = useState("");

  // ─── Fetch Resources with React Query ───────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ["resources", { page, search, type }],
    queryFn: () =>
      resourceAPI.getAll({ page, limit: 12, search: search || undefined, type: type || undefined }),
    select: (res) => res.data.data,
  });

  // ─── Create Resource Mutation ───────────────────────
  const createMutation = useMutation({
    mutationFn: (newResource) => resourceAPI.create(newResource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setShowForm(false);
      setForm({ title: "", url: "", type: "ARTICLE", description: "" });
      setFormError("");
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || "Failed to create resource");
    },
  });

  // ─── Delete Resource Mutation ───────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => resourceAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const getBadgeStyles = (resType) => {
    switch (resType) {
      case "VIDEO": return "bg-tertiary-container/20 text-tertiary border-tertiary-container/30";
      case "COURSE": return "bg-secondary-container/20 text-secondary border-secondary-container/30";
      case "ARTICLE": return "bg-primary-container/20 text-primary-fixed-dim border-primary-container/30";
      default: return "bg-surface-container-highest text-on-surface-variant border-outline-variant";
    }
  };

  const isOwner = (resource) => user && resource.authorId === user.id;

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <header className="mb-xl">
        <h2 className="font-display-xl text-display-xl text-on-surface mb-xs tracking-tighter">Resources Directory</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Explore curated materials to accelerate your learning journey.</p>
      </header>

      {/* Control Bar */}
      <section className="glass-card rounded-xl p-md mb-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-20">
        <div className="flex-1 w-full md:w-auto relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
          <input 
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-on-surface placeholder-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md" 
            placeholder="Search resources..." 
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {["", "VIDEO", "ARTICLE", "COURSE"].map((t) => (
            <button 
              key={t}
              onClick={() => { setType(t); setPage(1); }}
              className={`px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors border ${
                type === t 
                  ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20" 
                  : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline"
              }`}
            >
              {t === "" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        {isAuthenticated && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="w-full md:w-auto bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>{showForm ? "close" : "add"}</span>
            {showForm ? "Cancel" : "New Resource"}
          </button>
        )}
      </section>

      {/* Create Form */}
      {showForm && (
        <section className="glass-card rounded-xl p-lg mb-lg border border-primary/20 animate-fade-in relative z-20">
          <h3 className="font-headline-md text-on-surface mb-md">Add New Resource</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-md">
            {formError && <p className="text-error bg-error-container/20 p-3 rounded">{formError}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="input-wrapper mb-0">
                <input className="input-field" id="res-title" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <label className="floating-label font-body-md" htmlFor="res-title">Title</label>
              </div>
              <div className="input-wrapper mb-0">
                <input className="input-field" id="res-url" type="url" placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
                <label className="floating-label font-body-md" htmlFor="res-url">URL Link</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-on-surface-variant font-label-sm">Resource Type</label>
              <select 
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors appearance-none" 
                value={form.type} 
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="ARTICLE">Article</option>
                <option value="VIDEO">Video</option>
                <option value="COURSE">Course</option>
                <option value="PODCAST">Podcast</option>
                <option value="BOOK">Book</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="input-wrapper mb-0 h-full">
              <textarea 
                className="input-field min-h-[100px] resize-y" 
                id="res-desc" 
                placeholder="Description" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                required 
              />
              <label className="floating-label font-body-md" htmlFor="res-desc">Description</label>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={createMutation.isPending}
                className="bg-primary text-on-primary py-2 px-6 rounded-lg font-label-md hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {createMutation.isPending ? "Saving..." : "Save Resource"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Bento Grid / Cards */}
      <motion.section 
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10"
      >
        {isLoading && <div className="col-span-full text-center py-10"><span className="material-symbols-outlined spinner text-4xl text-primary">autorenew</span></div>}
        {error && <div className="col-span-full text-center py-10 text-error">Error loading resources.</div>}
        {data?.resources?.length === 0 && <div className="col-span-full text-center py-10 text-on-surface-variant">No resources found matching your criteria.</div>}

        {data?.resources?.map((resource) => (
          <motion.article 
            key={resource.id} 
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
            }}
            whileHover={{ scale: 1.02, y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            className="glass-card rounded-xl p-md flex flex-col group relative overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(208,188,255,0.15)] cursor-pointer" 
            onClick={() => window.open(resource.url, "_blank")}
          >
            
            {isOwner(resource) && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(resource.id); }}
                  disabled={deleteMutation.isPending}
                  className="p-2 rounded-full bg-error-container/80 text-on-error-container hover:bg-error hover:text-on-error transition-colors shadow-lg"
                  title="Delete resource"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>delete</span>
                </button>
              </div>
            )}

            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full font-label-sm text-label-sm border mb-3 ${getBadgeStyles(resource.type)}`}>
                {resource.type.charAt(0) + resource.type.slice(1).toLowerCase()}
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2 pr-10 group-hover:text-primary transition-colors">{resource.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">{resource.description}</p>
            </div>
            
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  by {resource.author?.name || "Unknown"}
                </span>
                {resource.tags?.slice(0, 2).map((rt) => (
                  <span key={rt.tagId} className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    {rt.tag.name}
                  </span>
                ))}
              </div>
              <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
            </div>
          </motion.article>
        ))}
      </motion.section>

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

export default ResourcesPage;
