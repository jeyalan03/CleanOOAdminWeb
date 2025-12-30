import axios from "axios";

import { auth } from "../firebase";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Add a request interceptor
API.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error attaching token:", error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
