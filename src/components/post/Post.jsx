import { Link } from "react-router-dom";
import "./post.scss";

// Component
import Comments from "../comments/Comments.jsx";

// Icons
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";

export default function Post({ post }) {
  //TEMPORARY
  const liked = false;

  return (
    <div className="post">
      <div className="user">
        <div className="userInfo">
          <img src={post.profilePic} alt="user" />
          <div className="details">
            <Link to={`/profile/${post.userId}`} style={{ color: "inherit" }}>
              <span className="name">
                {post.firstName} {post.lastName}
              </span>
            </Link>
            <span className="date">1 min ago</span>
          </div>
        </div>

        <MoreHorizIcon />
      </div>

      <div className="content">
        <p>{post.desc}</p>
        <img src={post.img} alt="" />
      </div>

      <div className="interactions">
        <div className="item">
          {liked ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
          32 Likes
        </div>
        <div className="item">
          <TextsmsOutlinedIcon />
          16 Comments
        </div>
        <div className="item">
          <ShareOutlinedIcon />
          Share
        </div>
      </div>

      <Comments />
    </div>
  );
}
