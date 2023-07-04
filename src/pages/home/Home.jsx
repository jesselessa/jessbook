import "./home.scss";
import Posts from "../../components/posts/Posts.jsx";
import Stories from "../../components/stories/Stories.jsx";

export default function Home() {
  return (
    <div className="home">
      <Stories />
      <Posts />
    </div>
  );
}
