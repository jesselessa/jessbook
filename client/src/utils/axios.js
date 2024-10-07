import axios from "axios";

// Call API
export const makeRequest = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // Send cookies in request
});
