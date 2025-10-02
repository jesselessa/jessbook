import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";

// Components
import Post from "../post/Post.jsx";
import Loader from "../loader/Loader.jsx";

export default function Posts({ userId }) {
  const getPosts = async (userId) => {
    try {
      const res = await makeRequest.get(`/posts?userId=${userId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const {
    isLoading,
    error,
    data: posts,
  } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => getPosts(userId),
  });

  return (
    <div className="posts">
      {error ? (
        "Something went wrong."
      ) : isLoading ? (
        <Loader />
      ) : posts?.length === 0 ? (
        "No post to show yet."
      ) : (
        posts?.map((post) => <Post key={post?.id} post={post} />)
      )}
    </div>
  );
}
