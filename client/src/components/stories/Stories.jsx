import { useContext } from "react";
import "./stories.scss";

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Stories() {
  const { currentUser } = useContext(AuthContext);

  // !TODO - Replace with data fetched from API
  const stories = [
    {
      id: 1,
      user: {
        firstName: "Jane",
        lastName: "Doe",
      },
      img: "https://images.pexels.com/photos/1186116/pexels-photo-1186116.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 2,
      user: {
        firstName: "Clark",
        lastName: "Kent",
      },
      img: "https://images.pexels.com/photos/13713020/pexels-photo-13713020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 3,
      user: {
        firstName: "Mickey",
        lastName: "Mouse",
      },
      img: "https://images.pexels.com/photos/14554020/pexels-photo-14554020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 4,
      user: {
        firstName: "Cinderella",
        lastName: "Princess",
      },
      img: "https://images.pexels.com/photos/14344896/pexels-photo-14344896.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 5,
      user: {
        firstName: "Simba",
        lastName: "Lion",
      },
      img: "https://images.pexels.com/photos/16671959/pexels-photo-16671959/free-photo-of-plage-gens-sable-marcher.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
  ];

  return (
    <div className="stories">
      {/* User's story */}
      <div className="wrapper">
        <div className="userStory">
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
              {story.user.firstName} {story.user.lastName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
