import axios from "axios";
import { Navigate } from "react-router-dom";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const registerUser = async (data) => {
  const response = await API.post("api/auth/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await API.post("api/auth/login", data);
  return response.data;
};

// Save token with expiry time
export const saveToken = (token) => {
  const expiry = new Date().getTime() + 60 * 60 * 1000; // 1 hour

  const authData = {
    token,
    expiry,
  };

  localStorage.setItem("auth", JSON.stringify(authData));
};

// Get token only if not expired
export const getToken = () => {
  const auth = localStorage.getItem("auth");

  if (!auth) return null;

  const parsedAuth = JSON.parse(auth);

  if (new Date().getTime() > parsedAuth.expiry) {
    logoutUser();
    return null;
  }

  return parsedAuth.token;
};

export const logoutUser = () => {
  localStorage.removeItem("auth");
  console.log("logout successfull");
};