import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token=localStorage.getItem("access_token");
console.log("chat.js",token);

const apiclient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Authorization: token ? `Bearer ${token}` : undefined,
    "Content-Type": "application/json",
  },
});

// 🔹 Reusable request handler
const request = async (method, url, data = null) => {
  try {
    const response = await apiclient({ method, url, data });
    return response.data; // return only data (simpler for consumers)
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// APIs
const getChatSessions = () => request("get", "/chat_data/getsession");

export { getChatSessions, API_BASE_URL };
