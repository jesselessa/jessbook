import { useContext, useState } from "react";
import "./comments.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";
import moment from "moment";

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

  // Fetch post comments
  const fetchPostComments = async () => {
    return await makeRequest
      .get(`/comments?postId=${postId}`)
      .then((res) => res.data)
      .catch((error) =>
        console.log("Error fetching comments from Comments.jsx:", error)
      );
  };

  const {
    isLoading,
    error,
    data: comments,
  } = useQuery({ queryKey: ["comments", postId], queryFn: fetchPostComments });

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["comments", postId]);
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();

    mutation.mutate({ desc: desc.trim(), postId });
    setDesc(""); // Reset field
  };

  // Open update form and store selected comment
  const handleUpdate = (comment) => {
    setOpenUpdate(true);
    setSelectedComment(comment);
  };

  // Delete comment
  const deleteMutation = useMutation(
    (commentId) => makeRequest.delete(`/comments/${commentId}`),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["comments", postId]);
      },
    }
  );

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
                : "https://images.pexels.com/photos/1454288/pexels-photo-1454288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            }
            alt="user"
          />
        </div>

        <div className="inputGroup">
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

      {error
        ? "Something went wrong"
        : isLoading
        ? "Loading..."
        : comments.map((comment) => (
            <div className="comment" key={comment.id}>
              <div className="img-container">
                <img
                  src={
                    comment.profilePic
                      ? `/uploads/${comment.profilePic}`
                      : "https://images.pexels.com/photos/1454288/pexels-photo-1454288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
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
                  <div className="editBtns">
                    <EditOutlinedIcon
                      className="editBtn"
                      fontSize="large"
                      onClick={() => handleUpdate(comment)}
                    />
                    <DeleteOutlineOutlinedIcon
                      className="editBtn"
                      fontSize="large"
                      onClick={() => handleDelete(comment)}
                    />
                  </div>
                )}

                <span className="time">
                  {moment(comment.creationDate).fromNow()}
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
