import api from "./axios";

export const tagAPI = {
  getAll: () => api.get("/tags"),
  create: (name) => api.post("/tags", { name }),
  delete: (id) => api.delete(`/tags/${id}`),
};
