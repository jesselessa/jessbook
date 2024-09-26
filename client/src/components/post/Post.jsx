import { useState, useContext } from "react";
import "./post.scss";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { addNonBreakingSpace } from "../../utils/addNonBreakingSpace.js";
import moment from "moment";
import { toast } from "react-toastify";

// Components
import Comments from "../comments/Comments.jsx";
import UpdatePost from "../update/UpdatePost.jsx";

// Icons
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

// Image
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Post({ post }) {
  const { currentUser } = useContext(AuthContext);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const navigateAndScrollTop = () => {
    navigate(`/profile/${post.userId}`);
    window.scrollTo(0, 0);
  };

  // Get comments
  const fetchPostComments = async () => {
    try {
      const res = await makeRequest.get(`/comments?postId=${post.id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw new Error(error);
    }
  };

  const { data: comments } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: fetchPostComments,
  });

  // Handle likes
  const fetchPostLikes = async () => {
    try {
      const res = await makeRequest.get(`/likes?postId=${post.id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching post likes:", error);
      throw new Error(error);
    }
  };

  const {
    isLoading,
    error,
    data: likes,
  } = useQuery({ queryKey: ["likes", post.id], queryFn: fetchPostLikes });

  const handleLikesMutation = useMutation({
    mutationFn: (liked) => {
      if (liked) return makeRequest.delete(`/likes?postId=${post.id}`);
      return makeRequest.post("/likes", { postId: post.id });
    },

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["likes", post.id]);
    },

    onError: (error) => {
      console.error(error);
      toast.error("Error handling likes data.");
    },
  });

  const handleLikes = () => {
    handleLikesMutation.mutate(likes.includes(currentUser.id));
  };

  // Delete post
  const deleteMutation = useMutation({
    mutationFn: (postId) => makeRequest.delete(`/posts/${postId}`),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["posts"]);
      toast.success("Post deleted.");
    },

    onError: (error) => {
      console.error(error);
      toast.error("Error deleting post.");
    },
  });

  const handleDelete = (post) => {
    try {
      deleteMutation.mutate(post.id);
    } catch (error) {
      console.error("Error deleting post:", error);
      throw new Error(error);
    }
  };

  return (
    <div className="post">
      <div className="user">
        <div className="user-info">
          <div className="img-container" onClick={navigateAndScrollTop}>
            <img
              src={
                post.profilePic ? `/uploads/${post.profilePic}` : defaultProfile
              }
              alt="user"
            />
          </div>

          <div className="details">
            <span className="name" onClick={navigateAndScrollTop}>
              {post.firstName} {post.lastName}
            </span>
            <span className="date">{moment(post.createdAt).fromNow()}</span>
          </div>
        </div>

        {currentUser.id === post.userId && (
          <div className="edit-buttons">
            <EditOutlinedIcon
              className="edit-btn"
              fontSize="large"
              onClick={() => setOpenUpdate((prevState) => !prevState)}
            />
            <DeleteOutlineOutlinedIcon
              className="edit-btn"
              fontSize="large"
              onClick={() => handleDelete(post)}
            />
          </div>
        )}
      </div>

      <div className="content">
        <p>{addNonBreakingSpace(post.desc)}</p>
        {post.img && <img src={`/uploads/${post.img}`} alt="post" />}
      </div>

      <div className="interactions">
        <div className="item">
          {error ? (
            "Something went wrong."
          ) : isLoading ? (
            "Loading..."
          ) : likes.includes(currentUser.id) ? (
            <FavoriteOutlinedIcon sx={{ color: "red" }} onClick={handleLikes} />
          ) : (
            <FavoriteBorderOutlinedIcon onClick={handleLikes} />
          )}
          {likes?.length > 0 && likes.length} {""}
          <span>{likes?.length > 1 ? "Likes" : "Like"}</span>
        </div>

        <div
          className="item"
          onClick={() => setCommentsOpen((prevState) => !prevState)}
        >
          <TextsmsOutlinedIcon />
          {comments?.length > 0 && comments?.length} {""}
          <span>{comments?.length > 1 ? "Comments" : "Comment"}</span>
        </div>

        <div className="item">
          <ShareOutlinedIcon />
          Share
        </div>
      </div>

      {commentsOpen && <Comments postId={post.id} />}

      {openUpdate && <UpdatePost setOpenUpdate={setOpenUpdate} post={post} />}
    </div>
  );
}
