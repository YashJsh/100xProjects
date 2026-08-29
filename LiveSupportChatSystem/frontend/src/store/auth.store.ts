import { create } from "zustand";
import { api } from "@/lib/api";

export type Role = "CANDIDATE" | "SUPERVISOR" | "AGENT" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  signup: (payload: { name: string; email: string; password: string; role?: Role }) => Promise<User>;
  signin: (payload: { email: string; password: string }) => Promise<User>;
  fetchMe: () => Promise<User | null>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  })(),
  token: localStorage.getItem("token") || null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  signup: async ({ name, email, password, role = "CANDIDATE" }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/signup", { name, email, password, role });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({
        token: data.token,
        user: data.user,
        isLoading: false,
        error: null,
      });

      return data.user;
    } catch (err: any) {
      set({ error: err.message || "An error occurred during signup", isLoading: false });
      throw err;
    }
  },

  signin: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/signin", { email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({
        token: data.token,
        user: data.user,
        isLoading: false,
        error: null,
      });

      return data.user;
    } catch (err: any) {
      set({ error: err.message || "An error occurred during signin", isLoading: false });
      throw err;
    }
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return null;

    set({ isLoading: true });
    try {
      const { data } = await api.get("/auth/me");

      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, isLoading: false });
      return data.user;
    } catch (err) {
      get().logout();
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isLoading: false, error: null });
  },
}));
