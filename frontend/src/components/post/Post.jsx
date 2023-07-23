import { useState, useContext } from "react";
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

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Post({ post }) {
  const { currentUser } = useContext(AuthContext);

  const [commentsOpen, setCommentsOpen] = useState(false);

  // TODO : Remove later Like btn feature
  const liked = false;

  //TODO- Check later for post photo if no pic */}

  return (
    <div className="post">
      <div className="user">
        <div className="userInfo">
          <div className="img-container">
            <img src={currentUser.profilePic} alt="user" />
          </div>
          <div className="details">
            <Link
              to={`/profile/${currentUser.id}`}
              style={{ color: "inherit" }}
            >
              <span className="name">
                {currentUser.firstName} {currentUser.lastName}
              </span>
            </Link>
            <span className="date">1 min ago</span>
          </div>
        </div>

        <MoreHorizIcon className="moreBtn" />
      </div>

      <div className="content">
        <p>{post.desc}</p>
        <img src={post.img} alt="post pic" />
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

      {commentsOpen && <Comments />}
    </div>
  );
}
