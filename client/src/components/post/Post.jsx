import { useState, useContext, useEffect } from "react";
import "./post.scss";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { fetchPostComments } from "../../utils/fetchPostComments.js";
import { addNonBreakingSpace } from "../../utils/addNonBreakingSpace.js";
import moment from "moment";
import { toast } from "react-toastify";
import { debounce } from "lodash";

// Components
import Comments from "../comments/Comments.jsx";
import UpdatePost from "../update/UpdatePost.jsx";
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";

// Image
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Icons
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Post({ post }) {
  const { currentUser } = useContext(AuthContext);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const navigateAndScrollTop = () => {
    navigate(`/profile/${post.userId}`);
    window.scrollTo(0, 0); // Top of the page
  };

  // Get post comments
  const { data: comments } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => fetchPostComments(post.id),
  });

  // Get post likes
  const fetchPostLikes = async (postId) => {
    try {
      const res = await makeRequest.get(`/likes?postId=${postId}`);
      return res.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching post likes:", error);
      }
      toast.error("An error occurred while fetching post likes.");
    }
  };

  // Query data for likes
  const { data: postLikes } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () => fetchPostLikes(post.id),
  });

  // Likes/Comments counts
  const likesCount = postLikes?.length || 0;
  const commentsCount = comments?.length || 0;

  // Optimistic mutation for current user's likes
  const handleLikeMutation = useMutation({
    mutationFn: (isPostLiked) => {
      // If already liked → Remove like
      if (isPostLiked) return makeRequest.delete(`/likes?postId=${post.id}`);
      // If not liked → Add like
      return makeRequest.post("/likes", { postId: post.id });
    },

    // Before the request (mutationFn), cancel ongoing fetches and store query cached data
    onMutate: async (isPostLiked) => {
      await queryClient.cancelQueries(["likes", post.id]);
      const previousLikes = queryClient.getQueryData(["likes", post.id]);

      // Optimistically update cache
      queryClient.setQueryData(["likes", post.id], (oldData = []) => {
        //* oldData = [] : if oldPosts is undefined, it becomes an empty array that can be used without any problem
        if (isPostLiked) {
          // If user had liked → Remove their ID
          return oldData.filter((id) => id !== currentUser.id);
        } else {
          // If user had not liked → Add their ID
          return [...oldData, currentUser.id];
        }
      });

      return { previousLikes }; // Context for rollback
    },

    // If mutation fails → Rollback
    onError: (err, _isPostLiked, context) => {
      if (import.meta.env.DEV) console.error("Error updating post likes:", err);
      toast.error("An error occurred while updating post likes.");

      if (context?.previousLikes) {
        queryClient.setQueryData(["likes", post.id], context.previousLikes);
      }
    },

    // Always refetch after mutation (server is source of truth)
    onSettled: () => {
      queryClient.invalidateQueries(["likes", post.id]);
    },
  });

  // Mutation to delete posts
  const deleteMutation = useMutation({
    mutationFn: (postId) => makeRequest.delete(`/posts/${postId}`),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["posts"]);
      toast.success("Post deleted.");
    },

    onError: (error) => {
      if (import.meta.env.DEV) console.error("Error deleting post:", error);
      toast.error("An error occurred while deleting post.");
    },
  });

  const isPostLiked = postLikes?.includes(currentUser?.id) || false;

  // Add a debounce mechanism to prevent excessive API calls if a user clicks multiple times rapidly on "❤️" ("Like" button)
  const debouncedHandleLike = debounce(() => {
    handleLikeMutation.mutate(isPostLiked);
  }, 300);

  useEffect(() => {
    // Cleanup: Cancels debounce callbacks if the component is unmounted
    return () => {
      debouncedHandleLike.cancel();
    };
  }, []);

  const handleLike = () => {
    debouncedHandleLike();
  };

  const handleDelete = (post) => {
    deleteMutation.mutate(post.id);
  };

  return (
    <div className="post">
      <div className="user">
        <div className="user-info">
          <div className="img-container" onClick={navigateAndScrollTop}>
            <LazyLoadImage
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

        {currentUser?.id === post.userId && (
          <div className="edit-buttons">
            <EditOutlinedIcon
              className="edit-btn"
              fontSize="large"
              onClick={() => setIsUpdateOpen(!isUpdateOpen)}
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
        {/* Text */}
        <p>{addNonBreakingSpace(post.text)}</p>
        {/* Image (optional) */}
        {post.img && <LazyLoadImage src={`/uploads/${post.img}`} alt="post" />}
      </div>

      <div className="interactions">
        <div className="item">
          {isPostLiked ? (
            <FavoriteOutlinedIcon sx={{ color: "red" }} onClick={handleLike} />
          ) : (
            <FavoriteBorderOutlinedIcon onClick={handleLike} />
          )}
          {likesCount > 0 && likesCount} {""}
          <span>{likesCount > 1 ? " Likes" : "Like"}</span>
        </div>

        <div className="item" onClick={() => setIsCommentsOpen(!isCommentsOpen)}>
          <TextsmsOutlinedIcon />
          {commentsCount > 0 && commentsCount} {""}
          <span>{commentsCount > 1 ? "Comments" : "Comment"}</span>
        </div>

        <div className="item">
          <ShareOutlinedIcon />
          Share
        </div>
      </div>

      {isCommentsOpen && (
        <Comments
          postId={post.id}
          isOpen={isCommentsOpen}
          setIsOpen={setIsCommentsOpen}
        />
      )}

      {isUpdateOpen && (
        <UpdatePost
          post={post}
          userId={post.userId}
          setIsOpen={setIsUpdateOpen}
        />
      )}
    </div>
  );
}
