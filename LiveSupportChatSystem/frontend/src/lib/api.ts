import axios from "axios";

const getEnvVar = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== "undefined" && import.meta && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch (e) {}
  try {
    if (typeof process !== "undefined" && process && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {}
  return fallback;
};

export const API_BASE_URL = getEnvVar("VITE_API_URL", "http://localhost:3000");

console.log("🌐 Configured API_BASE_URL:", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically attach Authorization token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract error message cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected network error occurred";
    return Promise.reject(new Error(message));
  }
);
