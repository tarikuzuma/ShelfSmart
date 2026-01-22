import api from "@/lib/api";

export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const res = await api.get("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch {
    return null;
  }
}
