import { makeRequest } from "./axios.js";

export const fetchUserData = async (userId) => {
  try {
    const res = await makeRequest.get(`/users/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // Propagate error to the calling component
  }
};

export const fetchPostComments = async (postId) => {
  try {
    const res = await makeRequest.get(`/comments?postId=${postId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching post comments:", error);
    throw error;
  }
};
