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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Post({ post }) {
  const { currentUser } = useContext(AuthContext);
  const [comments, setComments] = useState([]); 
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch post comments
  useEffect(() => {
    fetchPostComments();
  }, [comments]);

  const fetchPostComments = async () => {
    await makeRequest
      .get(`/comments?postId=${post.id}`)
      .then((res) => {
        setComments(res.data);
      })
      .catch((error) => console.log("Error fetching post comments:", error));
  };

  // Like/unlike post
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

  const handleLike = () => {
    mutation.mutate(data.includes(currentUser.id));
  };

  // Update and delete post
  const updateMutation = useMutation(
    (postId) => makeRequest.put(`/posts/${postId}`),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  const deleteMutation = useMutation(
    (postId) => makeRequest.delete(`/posts/${postId}`),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  const handleUpdate = () => {
    try {
      updateMutation.mutate(post.id);
    } catch (error) {
      console.error("Error updating post:", error);
      // navigate(`/update/${post.id}`);
    }
  };

  const handleDelete = () => {
    try {
      deleteMutation.mutate(post.id);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="post">
      <div className="user">
        <div className="userInfo">
          <Link to={`/profile/${post.userId}`}>
            <div className="img-container">
              {/* Change later with image upload */}
              <img
                src={
                  post.profilePic ||
                  "https://images.pexels.com/photos/1586981/pexels-photo-1586981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                }
                alt="user"
              />
              {/* <img src={`/uploads/${post.profilePic}`} alt="user" /> */}
            </div>
          </Link>

          <div className="details">
            <Link to={`/profile/${post.userId}`} style={{ color: "inherit" }}>
              <span className="name">
                {post.firstName} {post.lastName}
              </span>
            </Link>
            <span className="date">{moment(post.creationDate).fromNow()}</span>
          </div>
        </div>
        <div className="buttons">
          <MoreHorizIcon
            className="moreBtn"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && post.userId === currentUser.id && (
            <div className="editBtns">
              <EditOutlinedIcon
                className="editBtn"
                fontSize="large"
                onClick={handleUpdate}
              />
              <DeleteOutlineOutlinedIcon
                className="editBtn"
                fontSize="large"
                onClick={handleDelete}
              />
            </div>
          )}
        </div>
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
