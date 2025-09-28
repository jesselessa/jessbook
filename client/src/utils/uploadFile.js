//***************************** uploadFile.js ********************************
// Goal : transfer file and provide its name for next step (story creation)
//****************************************************************************

import { makeRequest } from "./axios.js";
import { toast } from "react-toastify";

export const uploadFile = async (file) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await makeRequest.post("/uploads", formData); // If the request succeeds, return the file name string
    return res.data;
  } catch (error) {
    // 1 - Log the failure for debugging
    console.error("File upload failed:", error);

    // 2 - Display an error message
    const errorMessage =
      error.response?.data?.message ||
      "File upload failed. Please check the file size (max 50MB) or format.";
    toast.error(errorMessage);

    // FIX : 3 - Return null on failure instead of throwing the error
    return null;
  }
};
