import "./timeline.scss";

// Components
import Stories from "../../components/stories/Stories.jsx";
import Publish from "../../components/publish/Publish.jsx";
import Posts from "../../components/posts/Posts.jsx";

export default function Timeline() {
  return (
    <div className="timeline">
      <Stories />
      <Publish />
      {/* Cf. posts controllers backend: Posts has no prop 'userId', so it's undefined → Shows the current user's posts and those of people he follows */}
      <Posts />
    </div>
  );
}
