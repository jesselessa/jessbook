import { makeRequest } from "./axios.js";

export const fetchPostComments = async (postId) => {
  try {
    const res = await makeRequest.get(`/comments?postId=${postId}`);
    return res.data;
  } catch (error) {
    console.error(
      "An unknown error occured while fetching post comments:",
      error.response?.data.message || error.message
    );
  }
};
