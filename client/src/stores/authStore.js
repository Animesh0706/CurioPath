import { create } from "zustand";
import { authAPI } from "../api/authAPI";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Set the user after login/register
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  // Clear user state on logout
  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),

  // Check if user is logged in on app load
  checkAuth: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const { data } = await authAPI.getMe();
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("accessToken");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Login
  login: async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem("accessToken", data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    return data;
  },

  // Register
  register: async (userData) => {
    const { data } = await authAPI.register(userData);
    localStorage.setItem("accessToken", data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    return data;
  },

  // Logout
  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      // Even if server logout fails, clear local state
    }
    localStorage.removeItem("accessToken");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

export default useAuthStore;
