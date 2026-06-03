import api from "@/lib/api";

export async function register(data) {
  var res = await api.post("/auth/register", data);
  return res.data.data;
}

export async function login(credentials) {
  var res = await api.post("/auth/login", credentials);
  return res.data.data;
}

export async function getMe() {
  var res = await api.get("/auth/me");
  return res.data.data;
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("shotlin_token");
  localStorage.removeItem("shotlin_user");
  document.cookie = "shotlin_token=; path=/; max-age=0";
  document.cookie = "shotlin_user=; path=/; max-age=0";
}