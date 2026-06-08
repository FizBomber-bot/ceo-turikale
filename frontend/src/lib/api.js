import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const fetchCategories = async () => (await api.get("/categories")).data;
export const fetchCaseStudies = async (category) =>
  (await api.get("/case-studies", { params: category ? { category } : {} })).data;
export const fetchProfile = async () => (await api.get("/profile")).data;
export const submitContact = async (payload) => (await api.post("/contact", payload)).data;
export const cvDownloadUrl = `${API}/cv`;

// Auth
export const authLogin = async (email, password) =>
  (await api.post("/auth/login", { email, password })).data;
export const authLogout = async () => (await api.post("/auth/logout")).data;
export const authMe = async () => (await api.get("/auth/me")).data;

// Admin
export const adminGetProfile = async () => (await api.get("/admin/profile")).data;
export const adminUpdateProfile = async (data) => (await api.put("/admin/profile", data)).data;
export const adminListCaseStudies = async () => (await api.get("/admin/case-studies")).data;
export const adminUpdateCaseStudy = async (id, data) =>
  (await api.put(`/admin/case-studies/${id}`, data)).data;
export const adminCreateCaseStudy = async (data) =>
  (await api.post("/admin/case-studies", data)).data;
export const adminDeleteCaseStudy = async (id) =>
  (await api.delete(`/admin/case-studies/${id}`)).data;
export const adminListContacts = async () => (await api.get("/admin/contacts")).data;
export const adminDeleteContact = async (id) =>
  (await api.delete(`/admin/contacts/${id}`)).data;

export const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/admin/upload/image", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const uploadCv = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/admin/upload/cv", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Absolute URL for backend-hosted assets (uploads)
export const assetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path}`;
};

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
