//***************************** uploadFile.js ********************************
// Goal: Transfer file and provide its name for next step (post/story creation)
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
    console.error("File upload failed:", error);
    // Propagate error to the calling function
    throw error;

    // Failure: Returns a 'null' value
    return null;
  }
};
