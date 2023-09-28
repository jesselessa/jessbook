import { useState, useContext } from "react";
import "./post.scss";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";
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
import { AuthContext } from "../../contexts/authContext";

export default function Post({ post }) {
  const { currentUser } = useContext(AuthContext);

  const [openUpdate, setOpenUpdate] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const navigate = useNavigate();

  const navigateAndScrollTop = () => {
    navigate(`/profile/${post.userId}`);
    window.scrollTo(0, 0);
  };

  // Get comments
  const fetchPostComments = async () => {
    return await makeRequest
      .get(`/comments?postId=${post.id}`)
      .then((res) => res.data)
      .catch((error) =>
        console.log("Error fetching comments from Post.jsx:", error)
      );
  };

  const queryClient = useQueryClient();

  const { data: comments } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: fetchPostComments,
  });

  // Handle likes
  const fetchPostLikes = async () => {
    return await makeRequest
      .get(`/likes?postId=${post.id}`)
      .then((res) => res.data)
      .catch((error) => console.log(error));
  };

  const {
    isLoading,
    error,
    data: likes,
  } = useQuery({ queryKey: ["likes", post.id], queryFn: fetchPostLikes });

  const mutation = useMutation(
    (liked) => {
      if (liked) return makeRequest.delete(`/likes?postId=${post.id}`);
      return makeRequest.post("/likes", { postId: post.id });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["likes", post.id]);
      },
    }
  );

  const handleLikes = () => {
    mutation.mutate(likes.includes(currentUser.id));
  };

  // Open update form
  const handleUpdate = () => {
    setOpenUpdate(true);
  };

  // Delete post
  const deleteMutation = useMutation(
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
      deleteMutation.mutate(post.id);
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
                post.profilePic
                  ? `/uploads/${post.profilePic}`
                  : defaultProfile
              }
              alt="user"
            />
          </div>

          <div className="details">
            <span className="name" onClick={navigateAndScrollTop}>
              {post.firstName} {post.lastName}
            </span>
            <span className="date">{moment(post.creationDate).fromNow()}</span>
          </div>
        </div>

        {currentUser.id === post.userId && (
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
        <p>{post.desc}</p>
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
          {likes?.length > 0 && likes.length} <span>Likes</span>
        </div>

        <div className="item" onClick={() => setCommentsOpen(!commentsOpen)}>
          <TextsmsOutlinedIcon />
          {comments?.length > 0 && comments.length} <span>Comments</span>
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
