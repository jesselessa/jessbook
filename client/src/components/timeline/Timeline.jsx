import "./timeline.scss";

// Components
import Stories from "../../components/stories/Stories.jsx";
import Posts from "../../components/posts/Posts.jsx";
import Publish from "../../components/publish/Publish.jsx";

export default function Timeline() {
  return (
    <div className="timeline">
      <Stories />
      <Publish />
      <Posts />
    </div>
  );
}
