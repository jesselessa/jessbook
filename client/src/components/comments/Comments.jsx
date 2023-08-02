import { useContext } from "react";
import "./comments.scss";

// Contexts
import { AuthContext } from "../../contexts/authContext.jsx";

// Icon
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

export default function Comments() {
  const { currentUser } = useContext(AuthContext);

  // TODO : Replace with data fetched from API
  const comments = [
    {
      id: 1,
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem nequeaspernatur ullam aperiam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem nequeaspernatur ullam aperiam",
      firstName: "John",
      lastName: "Doe",
      userId: 1,
      profilePic:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 2,
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem nequeaspernatur ullam bello",
      firstName: "John",
      lastName: "Doe",
      userId: 2,
      profilePic:
        "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1600",
    },
  ];

  // TODO : Complete the below function
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="comments">
      <form>
        <div className="img-container">
          <img src={currentUser.profilePic} alt="user" />
        </div>

        <div className="inputGroup">
          <input type="text" placeholder="Write a comment..." />
          <SendOutlinedIcon
            className="send"
            sx={{ fontSize: "24px", color: "#333" }}
            onClick={handleSubmit}
          />
        </div>

        <button type="submit" onClick={handleSubmit}>
          Send
        </button>
      </form>

      {comments.map((comment) => (
        <div className="comment" key={comment.id}>
          <div className="img-container">
            <img src={comment.profilePic} alt="user" />
          </div>
          <div className="info">
            <h3>
              {comment.firstName} {comment.lastName}
            </h3>
            <p>{comment.desc}</p>
          </div>
          <span className="time">1 hour ago</span>
        </div>
      ))}
    </div>
  );
}
