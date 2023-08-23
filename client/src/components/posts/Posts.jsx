import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";
import "./posts.scss";

// Component
import Post from "../post/Post.jsx";

export default function Posts({ userId }) {
  const { isLoading, error, data } = useQuery(["posts", userId], () =>
    makeRequest.get(`/posts?userId=${userId}`).then((res) => res.data)
  );

  return (
    <div className="posts">
      {error
        ? "Something went wrong."
        : isLoading
        ? "Loading..."
        : data.map((post) => <Post post={post} key={post.id} />)}
    </div>
  );
}
