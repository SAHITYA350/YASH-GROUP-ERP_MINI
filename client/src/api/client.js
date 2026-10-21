import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

apiClient.interceptors.response.use(
  (response) => {
    const result = response.data;
    return result?.data ?? result;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      `Request failed (${error.response?.status || "network error"})`;
    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    return Promise.reject(enhancedError);
  }
);

export async function request(path, options = {}) {
  const method = (options.method || "GET").toLowerCase();
  const config = {
    url: path,
    method,
    headers: options.headers,
    params: options.params,
  };

  if (options.body !== undefined) {
    config.data = options.body;
  }

  return apiClient(config);
}

export default apiClient;
