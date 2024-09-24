import { makeRequest } from "./axios.js";

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await makeRequest.post("/uploads", formData);
    return res.data; // Returns file URL
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(error);
  }
};
