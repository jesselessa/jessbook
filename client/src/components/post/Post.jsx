import { useState, useContext } from "react";
import "./post.scss";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../utils/axios.js";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { usePostComments } from "../../hooks/usePostComments.js";
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

// Images
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Post({ post }) {
  const { currentUser } = useContext(AuthContext);

  const [openUpdate, setOpenUpdate] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const navigate = useNavigate();

  const navigateAndScrollTop = () => {
    navigate(`/profile/${post?.userId}`);
    window.scrollTo(0, 0);
  };

  // Fetch post comments by using custom hook
  const { data: comments } = usePostComments(post?.id);

  const queryClient = useQueryClient();

  // Handle likes
  const fetchPostLikes = async () => {
    return await makeRequest
      .get(`/likes?postId=${post?.id}`)
      .then((res) => res?.data)
      .catch((error) => console.log(error));
  };

  const {
    isLoading,
    error,
    data: likes,
  } = useQuery({ queryKey: ["likes", post?.id], queryFn: fetchPostLikes });

  const deleteLikeMutation = useMutation(
    (liked) => {
      if (liked) return makeRequest.delete(`/likes?postId=${post?.id}`);
      return makeRequest.post("/likes", { postId: post?.id });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["likes", post?.id]);
      },
    }
  );

  const handleLikes = () => {
    deleteLikeMutation.mutate(likes.includes(currentUser?.id));
  };

  // Open update form
  const handleUpdate = () => {
    setOpenUpdate(true);
  };

  // Delete post
  const deletePostMutation = useMutation(
    (postId) => makeRequest.delete(`/posts/${postId}`),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);

        toast.success("Post deleted.");
      },
    }
  );

  const handleDelete = (post) => {
    try {
      deletePostMutation.mutate(post?.id);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="post">
      <div className="user">
        <div className="userInfo">
          <div className="img-container" onClick={navigateAndScrollTop}>
            <img
              src={
                post?.profilePic
                  ? `/uploads/${post?.profilePic}`
                  : defaultProfile
              }
              alt="user"
            />
          </div>

          <div className="details">
            <span className="name" onClick={navigateAndScrollTop}>
              {post?.firstName} {post?.lastName}
            </span>
            <span className="date">{moment(post?.createdAt).fromNow()}</span>
          </div>
        </div>

        {currentUser?.id === post?.userId && (
          <div className="editBtns">
            <EditOutlinedIcon
              className="editBtn"
              fontSize="large"
              onClick={handleUpdate}
            />
            <DeleteOutlineOutlinedIcon
              className="editBtn"
              fontSize="large"
              onClick={() => handleDelete(post)}
            />
          </div>
        )}
      </div>

      <div className="content">
        <p>{post?.desc}</p>
        {post?.img && <img src={`/uploads/${post?.img}`} alt="post" />}
      </div>

      <div className="interactions">
        <div className="item">
          {error ? (
            <span className="loading-msg">Something went wrong.</span>
          ) : isLoading ? (
            <span className="loading-msg">Loading...</span>
          ) : likes?.includes(currentUser?.id) ? (
            <FavoriteOutlinedIcon sx={{ color: "red" }} onClick={handleLikes} />
          ) : (
            <FavoriteBorderOutlinedIcon onClick={handleLikes} />
          )}
          {/* Likes */}
          {likes?.length > 0 && likes?.length}{" "}
          <span className="likes">{likes?.length > 1 ? "Likes" : "Like"}</span>
        </div>

        {/* Comments */}
        <div className="item" onClick={() => setCommentsOpen(!commentsOpen)}>
          <TextsmsOutlinedIcon />
          {comments?.length > 0 && comments?.length}{" "}
          <span className="commentsNb">
            {comments?.length > 1 ? "Comments" : "Comment"}
          </span>
        </div>

        <div className="item">
          {/* TODO - Implement later */}
          <ShareOutlinedIcon />
          Share
        </div>
      </div>

      {commentsOpen && <Comments postId={post?.id} />}

      {openUpdate && <UpdatePost setOpenUpdate={setOpenUpdate} post={post} />}
    </div>
  );
}
