import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../utils/axios.js";

export const usePostComments = (postId) => {
  const fetchPostComments = async () => {
    return await makeRequest
      .get(`/comments?postId=${postId}`)
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error fetching comments:", error);

        throw new Error("Could not fetch comments"); // Throw error to let React Query handle it
      });
  };

  // Fetch and cache comments with Tanstack Query's useQuery
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: fetchPostComments,
    onError: (error) => {
      console.error("Query error:", error);
    },
  });
};
