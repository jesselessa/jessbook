import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../utils/axios.js";

export const usePostComments = (postId) => {
  const fetchPostComments = async () => {
    return await makeRequest
      .get(`/comments?postId=${postId}`)
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error fetching comments:", error);
      });
  };

  return useQuery({
    queryKey: ["comments", postId],
    queryFn: fetchPostComments,
  });
};
