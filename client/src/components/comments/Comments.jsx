import { useContext, useState } from "react";
import "./comments.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { addNonBreakingSpace } from "../../utils/addNonBreakingSpace.js";
import { toast } from "react-toastify";
import moment from "moment";

// Image
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
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  const queryClient = useQueryClient();

  // Get post comments
  const fetchPostComments = async () => {
    try {
      const res = await makeRequest.get(`/comments?postId=${postId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw new Error(error);
    }
  };

  const {
    isLoading,
    error,
    data: comments,
  } = useQuery({ queryKey: ["comments", postId], queryFn: fetchPostComments });

  // Create a new comment
  const mutation = useMutation({
    mutationFn: async (newComment) => {
      const res = await makeRequest.post("/comments", newComment);
      return res.data;
    },

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["comments", postId]);
      toast.success("Comment published.");
    },

    onError: (error) => {
      toast.error("Error creating comment.");
      throw new Error(error);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    mutation.mutate({ desc: desc.trim(), postId });
    setDesc(""); // Reset form field
  };

  // Open update form and store selected comment
  const handleUpdate = (comment) => {
    setOpenUpdate((prevState) => !prevState);
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
      toast.error("Error deleting comment.");
      throw new Error(error);
    },
  });

  const handleDelete = (comment) => {
    try {
      deleteMutation.mutate(comment.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw new Error(error);
    }
  };

  return (
    <div className="comments">
      <form name="comment-form" onSubmit={handleSubmit}>
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
            name="text"
            placeholder="Write a comment..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <SendOutlinedIcon
            className="send"
            sx={{ fontSize: "24px", color: "#333" }}
            onClick={handleSubmit}
          />
        </div>

        <button type="submit">Send</button>
      </form>

      {error
        ? "Something went wrong"
        : isLoading
        ? "Loading..."
        : comments?.map((comment) => (
            <div className="comment" key={comment?.id}>
              <div className="img-container">
                <img
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
                <p>{addNonBreakingSpace(comment?.desc)}</p>
              </div>
              <div className="buttons-time">
                {currentUser.id === comment?.userId && (
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
          ))}

      {openUpdate && selectedComment && (
        <UpdateComment
          setOpenUpdate={setOpenUpdate}
          comment={selectedComment}
        />
      )}
    </div>
  );
}
