import { useContext, useState } from "react";
import "./stories.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";

// Image
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Component
import CreateStory from "./CreateStory.jsx";

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Stories({ userId }) {
  const { currentUser } = useContext(AuthContext);

  const [openCreateStory, setOpenCreateStory] = useState(false);

  // Get stories
  const fetchStories = async () => {
    return await makeRequest
      .get(`/stories?userId=${userId}`)
      .then((res) => {
        return res.data;
      })
      .catch((error) => console.log(error));
  };

  const {
    isLoading,
    error,
    data: stories,
  } = useQuery({ queryKey: ["stories", userId], queryFn: fetchStories });

  return (
    <>
      <div className="stories">
        {/* Add a story */}
        <div className="wrapper">
          <div className="story">
            <img
              src={
                currentUser.profilePic
                  ? `/uploads/${currentUser.profilePic}`
                  : defaultProfile
              }
              alt="user"
            />
            <div className="add">Create a story</div>
            <button
              onClick={() => {
                setOpenCreateStory(true);
              }}
            >
              +
            </button>
          </div>

          {/* Friends' stories */}

          {error ? (
            "Something went wrong."
          ) : isLoading ? (
            "Loading..."
          ) : stories.length === 0 ? (
            <div className="msg">No story to show yet.</div>
          ) : (
            stories.map((story) => (
              <div className="story" key={story.id}>
                <img src={`/uploads/${story.img}`} alt="story" />
                <span>
                  {story.firstName} {story.lastName}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {openCreateStory && (
        <CreateStory setOpenCreateStory={setOpenCreateStory} />
      )}
    </>
  );
}
