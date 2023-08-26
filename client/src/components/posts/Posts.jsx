import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";

// Component
import Post from "../post/Post.jsx";

export default function Posts({ userId }) {
  const getPosts = async () => {
    return await makeRequest
      .get(`/posts?userId=${userId}`)
      .then((res) => res.data)
      .catch((error) => console.log(error));
  };

  const { isLoading, error, data } = useQuery(["posts"], getPosts);

  console.log("Posts:", data);

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
