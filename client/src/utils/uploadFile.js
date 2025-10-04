//***************************** uploadFile.js ********************************
// Goal: Transfer file and provide its name for next step (story creation)
//****************************************************************************

import { makeRequest } from "./axios.js";
import { toast } from "react-toastify";

export const uploadFile = async (file) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file); // Creates a FormData object with a key 'file' whose value is the file name

    const res = await makeRequest.post("/uploads", formData);
    // Success: Returns the file name string
    return res.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("File upload failed:", error);
    }
    const errorMessage =
      "File upload failed. Please, check the file size (max 50MB) or format.";
    toast.error(errorMessage);

    // Propagate error to the calling function
    throw error;

    // Failure: Returns a 'null' value
    return null;
  }
};
