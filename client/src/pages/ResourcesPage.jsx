import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceAPI } from "../api/resourceAPI";
import useAuthStore from "../stores/authStore";

const ResourcesPage = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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
      resourceAPI.getAll({ page, limit: 10, search: search || undefined, type: type || undefined }),
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Resources</h1>
        {isAuthenticated && (
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New Resource"}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", margin: "1rem 0", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          {formError && <p style={{ color: "red" }}>{formError}</p>}
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="ARTICLE">Article</option>
            <option value="VIDEO">Video</option>
            <option value="COURSE">Course</option>
            <option value="PODCAST">Podcast</option>
            <option value="BOOK">Book</option>
            <option value="OTHER">Other</option>
          </select>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} />
          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Resource"}
          </button>
        </form>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
        <input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="ARTICLE">Article</option>
          <option value="VIDEO">Video</option>
          <option value="COURSE">Course</option>
          <option value="PODCAST">Podcast</option>
          <option value="BOOK">Book</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Resource List */}
      {isLoading && <p>Loading resources...</p>}
      {error && <p style={{ color: "red" }}>Error loading resources.</p>}

      {data?.resources?.length === 0 && <p>No resources found.</p>}

      {data?.resources?.map((resource) => (
        <div key={resource.id} style={{ padding: "1rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0" }}>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                {resource.title}
              </a>
            </h3>
            <p style={{ margin: "0 0 0.25rem 0", color: "#666" }}>{resource.description}</p>
            <small>
              <strong>{resource.type}</strong> • by {resource.author?.name}
              {resource.tags?.length > 0 && (
                <> • Tags: {resource.tags.map((rt) => rt.tag.name).join(", ")}</>
              )}
            </small>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => deleteMutation.mutate(resource.id)}
              style={{ color: "red", cursor: "pointer" }}
            >
              Delete
            </button>
          )}
        </div>
      ))}

      {/* Pagination */}
      {data?.pagination && (
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <button disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
