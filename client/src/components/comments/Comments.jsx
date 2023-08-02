import { useContext, useState } from "react";
import "./comments.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";
import moment from "moment";

// Contexts
import { AuthContext } from "../../contexts/authContext.jsx";

// Icon
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

export default function Comments({ postId }) {
  const { currentUser } = useContext(AuthContext);

  const [desc, setDesc] = useState("");

  const { isLoading, error, data } = useQuery(["comments"], () =>
    makeRequest.get(`/comments?postId=${postId}`).then((res) => {
      return res.data;
    })
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

  return (
    <div className="comments">
      <form>
        <div className="img-container">
          <img src={currentUser.profilePic} alt="user" />
          {/* <img src={`/uploads/${currentUser.profilePic}`} alt="user" /> */}
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
                <img src={comment.profilePic} alt="user" />
                {/* <img src={`/uploads/${comment.profilePic}`} alt="user" /> */}
              </div>
              <div className="info">
                <h3>
                  {comment.firstName} {comment.lastName}
                </h3>
                <p>{comment.desc}</p>
              </div>
              <span className="time">
                {moment(comment.creationDate).fromNow()}
              </span>
            </div>
          ))}
    </div>
  );
}
