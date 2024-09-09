import { useContext, useState } from "react";
import "./comments.scss";
import { makeRequest } from "../../utils/axios.js";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { usePostComments } from "../../hooks/usePostComments.js";
import { useToggle } from "../../hooks/useToggle.js";
import { toast } from "react-toastify";
import moment from "moment";

// Images
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

// Component
import UpdateComment from "../update/UpdateComment.jsx";

// Icons
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

export default function Comments({ postId }) {
  const { currentUser } = useContext(AuthContext);

  const [desc, setDesc] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [openUpdate, toggleUpdate] = useToggle();

  // Fetch post comments by using custom hook
  const { data: comments, isLoading, error } = usePostComments(postId);

  const queryClient = useQueryClient();

  // Create comment
  const postMutation = useMutation({
    mutationFn: (newComment) => makeRequest.post("/comments", newComment),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["comments", postId]);
      toast.success("Comment published.");
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();

    postMutation.mutate({ desc: desc.trim(), postId });
    setDesc(""); // Reset field after submission
  };

  // Open selected comment for update
  const handleToggleComment = (comment) => {
    setSelectedComment(comment);
    toggleUpdate();
  };

  // Delete comment
  const deleteMutation = useMutation({
    mutationFn: (commentId) => makeRequest.delete(`/comments/${commentId}`),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["comments", postId]);
      toast.success("Comment deleted.");
    },
  });

  const handleDelete = (comment) => {
    try {
      deleteMutation.mutate(comment.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="comments">
      <form>
        <div className="img-container">
          <img
            src={
              currentUser.profilePic
                ? `/uploads/${currentUser.profilePic}`
                : defaultProfile
            }
            alt="user"
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Write a comment..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <SendOutlinedIcon
            className="send"
            sx={{ fontSize: "24px", color: "#333" }}
            onClick={handleClick}
          />
        </div>

        <button onClick={handleClick}>Send</button>
      </form>

      {error ? (
        <span className="loading-msg">Something went wrong</span>
      ) : isLoading ? (
        <span className="loading-msg">Loading...</span>
      ) : (
        comments.map((comment) => (
          <div className="comment" key={comment.id}>
            <div className="img-container">
              <img
                src={
                  comment.profilePic
                    ? `/uploads/${comment.profilePic}`
                    : defaultProfile
                }
                alt="user"
              />
            </div>
            <div className="info">
              <h3>
                {comment.firstName} {comment.lastName}
              </h3>
              <p>{comment.desc}</p>
            </div>
            <div className="buttons-time">
              {currentUser.id === comment.userId && (
                <div className="edit-buttons">
                  <EditOutlinedIcon
                    className="edit-btn"
                    fontSize="large"
                    onClick={() => handleToggleComment(comment)}
                  />
                  <DeleteOutlineOutlinedIcon
                    className="edit-btn"
                    fontSize="large"
                    onClick={() => handleDelete(comment)}
                  />
                </div>
              )}

              <span className="time">
                {moment(comment.createdAt).fromNow()}
              </span>
            </div>
          </div>
        ))
      )}

      {/* Display update form when clicking on comment */}
      {openUpdate && (
        <UpdateComment comment={selectedComment} toggleUpdate={toggleUpdate} />
      )}
    </div>
  );
}
