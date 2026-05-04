import api from "./axios";

export const resourceAPI = {
  getAll: (params) => api.get("/resources", { params }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post("/resources", data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  attachTags: (resourceId, tags) =>
    api.post(`/resources/${resourceId}/tags`, { tags }),
  detachTag: (resourceId, tagId) =>
    api.delete(`/resources/${resourceId}/tags/${tagId}`),
};
