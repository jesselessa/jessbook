import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import "./post.scss";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios";
import moment from "moment";

// Component
import Comments from "../comments/Comments.jsx";

// Icons
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Post({ post }) {
  const { currentUser } = useContext(AuthContext);
  const [comments, setComments] = useState([]); // To fetch posts number
  const [commentsOpen, setCommentsOpen] = useState(false);

  // Fetch post comments
  useEffect(() => {
    fetchPostComments();
  }, []);

  const fetchPostComments = async () => {
    makeRequest
      .get(`/comments?postId=${post.id}`)
      .then((res) => {
        setComments(res.data);
      })
      .catch((error) => console.log("Error fetching post comments:", error));
  };

  // Likes feature
  const { isLoading, error, data } = useQuery(["likes", post.id], () =>
    makeRequest.get(`/likes?postId=${post.id}`).then((res) => res.data)
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (liked) => {
      if (liked) return makeRequest.delete(`/likes?postId=${post.id}`);
      return makeRequest.post("/likes", { postId: post.id });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["likes"]);
      },
    }
  );

  const deleteMutation = useMutation(
    (postId) => {
      return makeRequest.delete(`/posts/${postId}`);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  const handleLike = () => {
    mutation.mutate(data.includes(currentUser.id));
  };

  const handleDelete = () => {
    deleteMutation.mutate(post.id);
  };

  return (
    <div className="post">
      <div className="user">
        <div className="userInfo">
          <div className="img-container">
            {/* To replace */}
            <img src={post.profilePic} alt="user" />
            {/* <img src={`/uploads/${post.profilePic}`} alt="user" /> */}
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
        {/* To complete  */}
        <MoreHorizIcon className="moreBtn" />
      </div>

      <div className="content">
        <p>{post.desc}</p>
        <img src={`/uploads/${post.img}`} alt="post" />
      </div>

      <div className="interactions">
        <div className="item">
          {error ? (
            "Something went wrong."
          ) : isLoading ? (
            "Loading..."
          ) : data.includes(currentUser.id) ? (
            <FavoriteOutlinedIcon sx={{ color: "red" }} onClick={handleLike} />
          ) : (
            <FavoriteBorderOutlinedIcon onClick={handleLike} />
          )}
          {data?.length > 0 && data.length} <span>Likes</span>
        </div>

        <div className="item" onClick={() => setCommentsOpen(!commentsOpen)}>
          <TextsmsOutlinedIcon />
          {comments.length > 0 && comments.length} <span>Comments</span>
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
