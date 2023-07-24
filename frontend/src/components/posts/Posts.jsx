import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";
import "./posts.scss";

// Component
import Post from "../post/Post.jsx";

export default function Posts() {
  const { isLoading, error, data } = useQuery(["posts"], () =>
    makeRequest.get(`/posts`).then((res) => res.data)
  );

  return (
    <div className="posts">
      {error
        ? "An error occured."
        : isLoading
        ? "Loading..."
        : data.map((post) => <Post post={post} key={post.id} />)}
    </div>
  );
}
