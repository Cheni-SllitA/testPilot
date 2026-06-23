import axios from "axios";
import { Navigate } from "react-router-dom";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const fetchPrompt = async (payload) => {
  const response = await API.post("/api/ai/generate", payload);
  return response.data;
}