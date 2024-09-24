import axios from "axios";

// Call API
export const makeRequest = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // Because we use cookies
});
