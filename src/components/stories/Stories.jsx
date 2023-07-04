import { useContext } from "react";
import "./stories.scss";

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Stories() {
  const { currentUser } = useContext(AuthContext);

  // TODO : Replace data by the one fetched from API
  const stories = [
    {
      id: 1,
      firstName: "Jane",
      lastName: "Doe",
      img: "https://images.pexels.com/photos/14554020/pexels-photo-14554020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Doe",
      img: "https://images.pexels.com/photos/14554020/pexels-photo-14554020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 3,
      firstName: "Jane",
      lastName: "Doe",
      img: "https://images.pexels.com/photos/14554020/pexels-photo-14554020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 4,
      firstName: "Jane",
      lastName: "Doe",
      img: "https://images.pexels.com/photos/14554020/pexels-photo-14554020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
  ];

  return (
    <div className="stories">
      {/* User's story */}
      <div className="story">
        <img src={currentUser.profilePic} alt="user" />
        <span>{currentUser.name}</span>
        <div className="add">Create a story</div>
        <button>+</button>
      </div>

      {/* User's friends' stories */}
      {stories.map((story) => (
        <div className="story" key={story.id}>
          <img src={story.img} alt="story" />
          <span>
            {story.firstName} {story.lastName}
          </span>
        </div>
      ))}
    </div>
  );
}
