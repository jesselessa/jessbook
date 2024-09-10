import { useContext, useState } from "react";
import "./stories.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { useToggle } from "../../hooks/useToggle.js";

// Image
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Components
import CreateStory from "./CreateStory.jsx";
import ModalStory from "./ModalStory.jsx";

// Utility function checking if file is a video based on its extension
//! A regex must always return a value (true or false)
const isVideo = (fileName) =>
  /\.(mp4|mov|avi|mkv|webm|flv|wmv|3gp|m4v|ogv)$/i.test(fileName);

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Stories({ userId }) {
  const { currentUser } = useContext(AuthContext);

  const [openCreateStory, toggleCreateStory] = useToggle();
  const [openModal, toggleOpenModal] = useToggle();
  const [selectedStory, setSelectedStory] = useState(null);

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

  const handleClick = (story) => {
    setSelectedStory(story);
    toggleOpenModal();
  };

  return (
    <>
      <div className="stories">
        {/* Add a story */}
        <div className="stories-wrapper">
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
            <button onClick={toggleCreateStory}>+</button>
          </div>

          {/* Stories display */}
          {error ? (
            <span className="loading-msg">Something went wrong</span>
          ) : isLoading ? (
            <span className="loading-msg">Loading...</span>
          ) : stories.length === 0 ? (
            <span className="loading-msg">No story to show yet.</span>
          ) : (
            stories.map((story) => (
              <div
                className="story"
                key={story?.id}
                onClick={() => handleClick(story)}
                style={{ cursor: "pointer" }}
              >
                {isVideo(story?.img) ? (
                  <video
                  // 'controls' not necessary because it's a preview
                  >
                    <source
                      src={`/uploads/${story?.img}`}
                      type={`video/${story?.img.split(".").pop()}`}
                    />
                    Your browser doesn't support video.
                  </video>
                ) : (
                  <img src={`/uploads/${story?.img}`} alt="preview" />
                )}

                <span>
                  {story?.firstName} {story?.lastName}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {openCreateStory && <CreateStory toggleCreateStory={toggleCreateStory} />}

      {openModal && (
        <ModalStory story={selectedStory} toggleOpenModal={toggleOpenModal} />
      )}
    </>
  );
}
