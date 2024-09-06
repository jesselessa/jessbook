import { useContext, useState } from "react";
import "./stories.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { isVideo } from "../../utils/utils.js";

// Image
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Components
import CreateStory from "./CreateStory.jsx";
import ModalStory from "./ModalStory.jsx";

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Stories({ userId }) {
  const { currentUser } = useContext(AuthContext);

  const [openCreateStory, setOpenCreateStory] = useState(false);
  const [openModal, setOpenModal] = useState(false);
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
    setOpenModal(true);
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
            <span className="msg">Something went wrong</span>
          ) : // "Something went wrong."
          isLoading ? (
            // "Loading..."
            <span className="msg">Loading...</span>
          ) : stories.length === 0 ? (
            <span className="no-story">No story to show yet.</span>
          ) : (
            stories.map((story) => (
              <div
                className="story"
                key={story.id}
                onClick={() => handleClick(story)}
                style={{ cursor: "pointer" }}
              >
                {isVideo(story.img) ? (
                  <video
                  // 'controls' and 'type' attributes not needed
                  >
                    <source
                      src={`/uploads/${story.img}`}
                      type={
                        isVideo(story.img)
                          ? `video/${story.img.split(".").pop()}`
                          : ""
                      }
                    />
                  </video>
                ) : (
                  <img src={`/uploads/${story.img}`} alt="story" />
                )}

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

      {openModal && (
        <ModalStory
          story={selectedStory}
          setOpenModal={setOpenModal}
          onClose={() => setOpenModal(false)}
        />
      )}
    </>
  );
}
