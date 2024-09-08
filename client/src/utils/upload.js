import { makeRequest } from "./axios.js";

// Handle file upload
export const upload = async (file) => {
  try {
    const formData = new FormData(); // Because we can't send file directly to API
    formData.append("file", file);

    const res = await makeRequest.post("/uploads", formData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
