import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";

// Component
import Post from "../post/Post.jsx";

export default function Posts({ userId }) {
  const getPosts = async () => {
    return await makeRequest
      .get(`/posts?userId=${userId}`)
      .then((res) => res.data)
      .catch((error) => console.log(error));
  };

  const {
    isLoading,
    error,
    data: posts,
  } = useQuery({
    queryKey: ["posts", userId],
    queryFn: getPosts,
  });

  return (
    <div className="posts">
      {error ? (
        <span className="loading-msg">Something went wrong.</span>
      ) : isLoading ? (
        <span className="loading-msg">Loading...</span>
      ) : posts.length === 0 ? (
        <span className="loading-msg">No post to show yet.</span>
      ) : (
        posts.map((post) => <Post key={post.id} post={post} />)
      )}
    </div>
  );
}
