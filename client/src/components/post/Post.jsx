import { useState } from "react";
import { Link } from "react-router-dom";
import "./post.scss";
import moment from "moment";

// Component
import Comments from "../comments/Comments.jsx";

// Icons
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";

export default function Post({ post }) {
  const [commentsOpen, setCommentsOpen] = useState(false);

  // TODO : Remove later Like btn feature
  const liked = false;

  return (
    <div className="post">
      <div className="user">
        <div className="userInfo">
          <div className="img-container">
            <img src={post.profilePic} alt="user" />
          </div>
          <div className="details">
            <Link to={`/profile/${post.userId}`} style={{ color: "inherit" }}>
              <span className="name">
                {post.firstName} {post.lastName}
              </span>
            </Link>
            <span className="date">{moment(post.creationDate).fromNow()}</span>
          </div>
        </div>

        <MoreHorizIcon className="moreBtn" />
      </div>

      <div className="content">
        {/* Des */}
        <p>{post.desc}</p>
        <img src={`/uploads/${post.img}`} alt="post pic" />
      </div>

      <div className="interactions">
        <div className="item">
          {liked ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
          32 <span>Likes</span>
        </div>

        <div className="item" onClick={() => setCommentsOpen(!commentsOpen)}>
          <TextsmsOutlinedIcon />
          16 <span>Comments</span>
        </div>

        <div className="item">
          <ShareOutlinedIcon />
          Share
        </div>
      </div>

      {commentsOpen && <Comments postId={post.id} />}
    </div>
  );
}
