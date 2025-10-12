import { makeRequest } from "./axios.js";
import { toast } from "react-toastify";

export const fetchPostComments = async (postId) => {
  try {
    const res = await makeRequest.get(`/comments?postId=${postId}`);
    return res.data;
  } catch (error) {
    // Log error for debugging (development only)
    console.error("Error fetching post comments:", error);
    // Propagate error to the calling function
    throw error;
  }
};
