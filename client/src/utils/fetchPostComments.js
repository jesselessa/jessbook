import { makeRequest } from "./axios.js";

export const fetchPostComments = async (postId) => {
  try {
    const res = await makeRequest.get(`/comments?postId=${postId}`);
    return res.data;
  } catch (error) {
    throw error; // Propagate error without modifying it
  }
};
