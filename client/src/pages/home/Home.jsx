import { useParams } from "react-router-dom";
import "./home.scss";

// Components
import Stories from "../../components/stories/Stories.jsx";
import Posts from "../../components/posts/Posts.jsx";
import Publish from "../../components/publish/Publish.jsx";

export default function Home() {
  return (
    <div className="home">
      <Stories />
      <Publish />
      <Posts />
    </div>
  );
}
