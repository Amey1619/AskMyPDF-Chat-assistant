import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

const apiclient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// 🔹 Reusable request handler
const request = async (method, url, data = null) => {
  try {
    const response = await apiclient({ method, url, data });
    return response.data; // return only data for convenience
  } catch (error) {
    // normalize error response
    console.log("Amey loggs error:",error);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// Auth APIs
const signup = (email, password) =>
  request("post", "/auth/register/", { email, password });
const login = (email, password) =>
  request("post", "/auth/login/", { email, password });

export { signup, login, API_BASE_URL, WEBSOCKET_URL };
