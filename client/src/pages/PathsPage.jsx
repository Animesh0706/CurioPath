import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pathAPI } from "../api/pathAPI";
import useAuthStore from "../stores/authStore";

const PathsPage = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // ─── Create Form State ──────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [formError, setFormError] = useState("");

  // ─── Fetch Paths ────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ["paths", { page, search }],
    queryFn: () =>
      pathAPI.getAll({ page, limit: 10, search: search || undefined }),
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Learning Paths</h1>
        {isAuthenticated && (
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New Path"}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", margin: "1rem 0", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          {formError && <p style={{ color: "red" }}>{formError}</p>}
          <input placeholder="Path Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} />
          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Path"}
          </button>
        </form>
      )}

      {/* Search */}
      <div style={{ margin: "1rem 0" }}>
        <input
          placeholder="Search paths..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Path List */}
      {isLoading && <p>Loading paths...</p>}
      {error && <p style={{ color: "red" }}>Error loading paths.</p>}
      {data?.paths?.length === 0 && <p>No learning paths found.</p>}

      {data?.paths?.map((path) => (
        <div key={path.id} style={{ padding: "1rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0" }}>
              <Link to={`/paths/${path.id}`}>{path.title}</Link>
            </h3>
            <p style={{ margin: "0 0 0.25rem 0", color: "#666" }}>{path.description}</p>
            <small>
              {path.resources?.length || 0} resources • by {path.creator?.name}
            </small>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => deleteMutation.mutate(path.id)}
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

export default PathsPage;
