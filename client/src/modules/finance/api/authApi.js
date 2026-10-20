// Auth API - login and store the JWT for the finance module's client.
// (Not in the original tree, but the app needs a way to obtain a token.)
import api, { setToken } from "./client";

export const authApi = {
  // POST /api/auth/login -> { token, user }
  async login(email, password) {
    const data = await api.post("/auth/login", { email, password });
    setToken(data.token);
    return data.user;
  },
  logout() {
    setToken(null);
  },
};

export default authApi;
