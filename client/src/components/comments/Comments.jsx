import { useContext, useState } from "react";
import "./comments.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";
import moment from "moment";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

// Icons
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

export default function Comments({ postId }) {
  const { currentUser } = useContext(AuthContext);

  const [desc, setDesc] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch post comments
  const fetchPostComments = async () => {
    return await makeRequest
      .get(`/comments?postId=${postId}`)
      .then((res) => res.data)
      .catch((error) => console.log(error));
  };

  const { isLoading, error, data } = useQuery(
    ["comments", postId],
    fetchPostComments
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["comments"]);
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();
    mutation.mutate({ desc, postId });
    setDesc("");
  };

  // Update and delete comment
  const updateMutation = useMutation(
    (postId) => makeRequest.put(`/comments/${postId}`),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["comments"]);
      },
    }
  );

  const deleteMutation = useMutation(
    (postId) => makeRequest.delete(`/comments/${postId}`),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["comments"]);
      },
    }
  );

  const handleUpdate = (comment) => {
    try {
      updateMutation.mutate({
        id: comment.id,
        desc: desc, // Updated comment text
      });
      // navigate(`/update/${comment.id}`);
      // window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDelete = (comment) => {
    try {
      deleteMutation.mutate(comment.id);
    } catch (error) {
      console.error("Error deleting post:", error);
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
                : "https://images.pexels.com/photos/1586981/pexels-photo-1586981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
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
        : data.map((comment) => (
            <div className="comment" key={comment.id}>
              <div className="img-container">
                <img
                  src={
                    comment.profilePic
                      ? `/uploads/${comment.profilePic}`
                      : "https://images.pexels.com/photos/1586981/pexels-photo-1586981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
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
                <div className="buttons">
                  <MoreHorizIcon
                    className="moreBtn"
                    onClick={() => setMenuOpen(!menuOpen)}
                  />
                  {menuOpen && currentUser.id === comment.userId && (
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
                </div>
                <span className="time">
                  {moment(comment.creationDate).fromNow()}
                </span>
              </div>
            </div>
          ))}
    </div>
  );
}
