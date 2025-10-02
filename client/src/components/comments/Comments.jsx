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

export default function Comments({ postId }) {
  const { currentUser } = useContext(AuthContext);
  const [text, setText] = useState("");
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

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
    mutationFn: async (newComment) =>
      await makeRequest.post("/comments", newComment),

    onMutate: async (newComment) => {
      await queryClient.cancelQueries(["comments", postId]);
      const previousComments = queryClient.getQueryData(["comments", postId]);

      const currentDate = new Date().toISOString();

      // Create an optimistic comment
      const optimisticComment = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        text: newComment.text,
        postId: postId,
        createdAt: moment(currentDate).fromNow(),
      };

      // Optimistically update the post in cache
      queryClient.setQueryData(["comments", postId], (oldComment = []) => [
        ...oldComment,
        optimisticComment,
      ]);

      // Context for rollback
      return { previousComments };
    },

    // On error → Rollback to previous state
    onError: (err, _newComment, context) => {
      if (process.env.NODE_ENV === "development")
        console.error("Error creating comment:", err);
      toast.error(
        "Error creating comment: " +
          (err.response?.data?.message || err.message)
      );

      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments
        );
      }
    },

    // onSuccess → Display a message
    onSuccess: () => {
      toast.success("Comment published.");
    },

    // onSettled → Refetch data and reset state
    onSettled: () => {
      queryClient.invalidateQueries(["comments", postId]);
      setText("");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedText = text.trim();

    try {
      // Check comment length
      if (trimmedText?.length === 0) {
        toast.error("You must add a text to your comment.");
        return;
      }

      if (trimmedText?.length > 500) {
        toast.error(
          "Your comment can't contain more than 500\u00A0characters."
        );
        return;
      }

      createMutation.mutate({ text: addNonBreakingSpace(trimmedText) });
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  // Open update form and store selected comment
  const handleUpdate = (comment) => {
    setOpenUpdate(true);
    setSelectedComment(comment);
  };

  // Delete comment
  const deleteMutation = useMutation({
    mutationFn: (commentId) => makeRequest.delete(`/comments/${commentId}`),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["comments", postId]);
      toast.success("Comment deleted.");
    },

    onError: (error) => {
      console.error("Error deleting comment:", error);
      toast.error(
        "Error deleting comment: " +
          (error.response?.data?.message || error.message)
      );
    },
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
                    onClick={() => handleUpdate(comment)}
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

      {openUpdate && selectedComment && (
        <UpdateComment
          setOpenUpdate={setOpenUpdate}
          comment={selectedComment}
        />
      )}
    </div>
  );
}
