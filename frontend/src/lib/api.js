import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const fetchCategories = async () => (await api.get("/categories")).data;
export const fetchCaseStudies = async (category) =>
  (await api.get("/case-studies", { params: category ? { category } : {} })).data;
export const submitContact = async (payload) => (await api.post("/contact", payload)).data;
export const cvDownloadUrl = `${API}/cv`;
