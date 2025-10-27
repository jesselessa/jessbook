import { useContext, useState } from "react";
import "./comments.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { fetchPostComments } from "../../utils/fetchPostComments.js";
import { addNonBreakingSpace } from "../../utils/addNonBreakingSpace.js";
import { toast } from "react-toastify";
import moment from "moment";

// Components
import UpdateComment from "../update/UpdateComment.jsx";
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";
import Loader from "../loader/Loader.jsx";

// Image
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Icons
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Comments({ postId, isOpen, setIsOpen }) {
  const { currentUser } = useContext(AuthContext);
  const [selectedComment, setSelectedComment] = useState(null);
  const [text, setText] = useState("");

  const queryClient = useQueryClient();

  // Get post comments
  const {
    isLoading,
    error,
    data: comments,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchPostComments(postId),
  });

  // Create a new comment (with optimistic update)
  const createMutation = useMutation({
    mutationFn: async ({ text, postId }) =>
      await makeRequest.post("/comments", { text, postId }),

    // 1. OnMutate → Cancel ongoing queries and store existing query cached data
    onMutate: async ({ text, postId }) => {
      await queryClient.cancelQueries(["comments", postId]);
      const previousComments = queryClient.getQueryData(["comments", postId]);

      // Create an optimistic comment
      const currentDate = new Date();

      const optimisticComment = {
        id: crypto.randomUUID(), // Temporary ID for optimistic update
        userId: currentUser.id,
        text,
        createdAt: currentDate.toISOString(), // Temporary creation date
        // Note: We only add essential fields for rendering purposes
      };

      // Optimistically update the post in cache
      queryClient.setQueryData(["comments", postId], (oldComment = []) => [
        ...oldComment,
        optimisticComment,
      ]);

      // Context for rollback
      return { previousComments };
    },

    // 2. OnError → Rollback to previous state
    onError: (error, postId, context) => {
      console.error("Error creating comment:", error);
      toast.error(error.response?.data?.message || error.message);

      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments
        );
      }
    },

    // 3. OnSuccess → Display a message
    onSuccess: () => toast.success("Comment published."),

    // 4. OnSettled → Refetch data, reset and close form
    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries(["comments", postId]);

      setText(""); // Reset form input
      setIsOpen(true); // Keep comments open
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedText = text.trim();

    // Check comment length
    if (trimmedText?.length === 0) {
      toast.error("Your comment comment must contain a description.");
      return;
    }

    if (trimmedText?.length > 500) {
      toast.error("Your comment can't contain more than 500\u00A0characters.");
      return;
    }

    createMutation.mutate({
      text: addNonBreakingSpace(trimmedText),
      postId,
    });
  };

  // Open update form and store selected comment
  const openUpdate = (comment) => {
    setIsOpen(true);
    setSelectedComment(comment);
  };

  // Delete comment
  const deleteMutation = useMutation({
    mutationFn: (commentId) => makeRequest.delete(`/comments/${commentId}`),

    // 1. onMutate: Optimistically remove the comment from the cache
    onMutate: async (commentId) => {
      // Cancel any outgoing refetches on comments to prevent conflicts
      await queryClient.cancelQueries(["comments", postId]);

      // Store the current query cached data for rollback
      const previousComments = queryClient.getQueryData(["comments", postId]);

      // Optimistically remove the comment from the cache
      queryClient.setQueryData(["comments", postId], (oldComments = []) => {
        return oldComments.filter((c) => c.id !== commentId);
      });

      // Context for rollback (important: we also need the ID of the comment deleted)
      return { previousComments, deletedCommentId: commentId };
    },

    // 2. onError: Rollback to previous state if API call fails
    onError: (error, postId, context) => {
      console.error(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message);

      if (context?.previousComments) {
        // Rollback: restore the old list
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments
        );
        toast.error("Rollback successful. Comment deletion failed.");
      }
    },

    // 3. onSuccess: Display success message and finalize cache sync
    onSuccess: () => toast.success("Comment deleted."),

    // 4. onSettled: Optional cleanup
    onSettled: (_data, _error, postId) =>
      queryClient.invalidateQueries(["comments", postId]),
  });

  const handleDelete = (comment) => {
    deleteMutation.mutate(comment.id);
  };

  return (
    <div className="comments">
      <form name="comment-form" onSubmit={handleSubmit}>
        <div className="img-container">
          <LazyLoadImage
            src={
              currentUser?.profilePic
                ? `/uploads/${currentUser.profilePic}`
                : defaultProfile
            }
            alt="user"
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            name="text"
            placeholder="Write a comment..."
            value={text}
            autoComplete="off"
            onChange={(e) => setText(e.target.value)}
          />
          <SendOutlinedIcon
            className="send"
            sx={{ fontSize: "24px", color: "#333" }}
            onClick={handleSubmit}
          />
        </div>

        <button type="submit">Send</button>
      </form>

      {error ? (
        "Something went wrong"
      ) : isLoading ? (
        <Loader
          width="24px"
          height="24px"
          border="3px solid rgba(0, 0, 0, 0.1)"
        />
      ) : (
        comments?.map((comment) => (
          <div className="comment" key={comment?.id}>
            <div className="img-container">
              <LazyLoadImage
                src={
                  comment?.profilePic
                    ? `/uploads/${comment?.profilePic}`
                    : defaultProfile
                }
                alt="user"
              />
            </div>
            <div className="info">
              <h3>
                {comment?.firstName} {comment?.lastName}
              </h3>
              <p>{addNonBreakingSpace(comment?.text)}</p>
            </div>
            <div className="buttons-time">
              {currentUser?.id === comment?.userId && (
                <div className="edit-buttons">
                  <EditOutlinedIcon
                    className="edit-btn"
                    fontSize="large"
                    onClick={() => openUpdate(comment)}
                  />
                  <DeleteOutlineOutlinedIcon
                    className="edit-btn"
                    fontSize="large"
                    onClick={() => handleDelete(comment)}
                  />
                </div>
              )}

              <span className="time">
                {moment(comment?.createdAt).fromNow()}
              </span>
            </div>
          </div>
        ))
      )}

      {isOpen && selectedComment && (
        <UpdateComment setIsOpen={setIsOpen} comment={selectedComment} />
      )}
    </div>
  );
}
