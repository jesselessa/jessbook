import { makeRequest } from "./axios.js";
import { toast } from "react-toastify";

export const fetchPostComments = async (postId) => {
  try {
    const res = await makeRequest.get(`/comments?postId=${postId}`);
    return res.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "An error occurred while fetching comments. Please try again later.";

    toast.error(errorMessage);

    // Log error for debugging (development only)
    if (process.env.NODE_ENV === "development")
      console.error("Error fetching post comments:", error);

    // Propagate error without modifying it
    throw error;
  }
};
