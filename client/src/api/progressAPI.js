import api from "./axios";

export const progressAPI = {
  update: (data) => api.post("/progress", data),
  getAll: () => api.get("/progress"),
  getPathProgress: (pathId) => api.get(`/progress/path/${pathId}`),
};
