// Centralized API instance for axios with baseURL from env or default to localhost:8000
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

export default api;
