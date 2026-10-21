import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const csrf = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("yash_csrf="))
    ?.split("=")[1];

  if (csrf) config.headers["x-csrf-token"] = csrf;
  return config;
});

export function getApiErrorMessage(error) {
  return error.response?.data?.error?.message || error.message || "Request failed";
}

export default api;