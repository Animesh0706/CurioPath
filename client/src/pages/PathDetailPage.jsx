import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pathAPI } from "../api/pathAPI";
import { progressAPI } from "../api/progressAPI";
import useAuthStore from "../stores/authStore";

const PathDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [addResourceId, setAddResourceId] = useState("");

  const { data: path, isLoading } = useQuery({
    queryKey: ["path", id],
    queryFn: () => pathAPI.getById(id),
    select: (res) => res.data.data.path,
  });

  const { data: progressData } = useQuery({
    queryKey: ["pathProgress", id],
    queryFn: () => progressAPI.getPathProgress(id),
    select: (res) => res.data.data,
    enabled: isAuthenticated,
  });

  const addMut = useMutation({
    mutationFn: (rid) => pathAPI.addResource(id, rid),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["path", id] }); setAddResourceId(""); },
  });

  const removeMut = useMutation({
    mutationFn: (rid) => pathAPI.removeResource(id, rid),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["path", id] }); },
  });

  const progressMut = useMutation({
    mutationFn: ({ resourceId, status }) => progressAPI.update({ resourceId, status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pathProgress", id] }); },
  });

  if (isLoading) return <p>Loading...</p>;
  if (!path) return <p>Path not found.</p>;

  const pMap = {};
  progressData?.resources?.forEach((r) => { pMap[r.resourceId] = r.status; });

  return (
    <div>
      <h1>{path.title}</h1>
      <p style={{ color: "#666" }}>{path.description}</p>
      <small>By {path.creator?.name}</small>

      {progressData && (
        <div style={{ margin: "1.5rem 0", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Progress</h3>
          <div style={{ background: "#eee", borderRadius: "4px", height: "20px", overflow: "hidden" }}>
            <div style={{ background: "#4caf50", height: "100%", width: `${progressData.percentage}%` }} />
          </div>
          <small>{progressData.completed}/{progressData.totalResources} ({progressData.percentage}%)</small>
        </div>
      )}

      {isAuthenticated && (
        <div style={{ margin: "1rem 0", display: "flex", gap: "0.5rem" }}>
          <input placeholder="Resource ID" value={addResourceId} onChange={(e) => setAddResourceId(e.target.value)} style={{ flex: 1 }} />
          <button onClick={() => addMut.mutate(addResourceId)} disabled={!addResourceId}>Add</button>
        </div>
      )}

      <h2>Resources ({path.resources?.length || 0})</h2>
      {path.resources?.map((pr, i) => (
        <div key={pr.id} style={{ padding: "0.75rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", background: pMap[pr.resourceId] === "COMPLETED" ? "#e8f5e9" : "transparent" }}>
          <div>
            <strong>{i + 1}. </strong>
            <a href={pr.resource?.url} target="_blank" rel="noopener noreferrer">{pr.resource?.title}</a>
            <span style={{ marginLeft: "0.5rem", color: "#999", fontSize: "0.85rem" }}>[{pr.resource?.type}]</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {isAuthenticated && (
              <select value={pMap[pr.resourceId] || "TODO"} onChange={(e) => progressMut.mutate({ resourceId: pr.resourceId, status: e.target.value })}>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            )}
            {isAuthenticated && <button onClick={() => removeMut.mutate(pr.resourceId)} style={{ color: "red" }}>Remove</button>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PathDetailPage;
