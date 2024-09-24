import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";

// Component
import Post from "../post/Post.jsx";

export default function Posts({ userId }) {
  const getPosts = async () => {
    try {
      const res = await makeRequest.get(`/posts?userId=${userId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw new Error(error);
    }
  };

  const {
    isLoading,
    error,
    data: posts,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  return (
    <div className="posts">
      {error
        ? "Something went wrong."
        : isLoading
        ? "Loading..."
        : posts.length === 0
        ? "No post to show yet."
        : posts.map((post) => <Post key={post.id} post={post} />)}
    </div>
  );
}
