import axios from "axios";

// Call API
export const makeRequest = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true, // Send cookies in request
});
