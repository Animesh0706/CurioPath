import api from "./axios";

export const pathAPI = {
  getAll: (params) => api.get("/paths", { params }),
  getById: (id) => api.get(`/paths/${id}`),
  create: (data) => api.post("/paths", data),
  update: (id, data) => api.put(`/paths/${id}`, data),
  delete: (id) => api.delete(`/paths/${id}`),
  addResource: (pathId, resourceId) =>
    api.post(`/paths/${pathId}/resources`, { resourceId }),
  removeResource: (pathId, resourceId) =>
    api.delete(`/paths/${pathId}/resources/${resourceId}`),
  reorder: (pathId, orderedItems) =>
    api.put(`/paths/${pathId}/reorder`, { orderedItems }),
};
