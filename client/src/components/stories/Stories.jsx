import { useContext, useState } from "react";
import "./stories.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { isVideo } from "../../utils/isVideo.js";

// Components
import CreateStory from "./CreateStory.jsx";
import ModalStory from "./ModalStory.jsx";
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";
import Loader from "../loader/Loader.jsx";

// Image
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Stories({ userId }) {
  const { currentUser } = useContext(AuthContext);
  const [openCreateStory, setOpenCreateStory] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  // Get stories
  const fetchStories = async () => {
    try {
      const res = await makeRequest.get(`/stories?userId=${userId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  const {
    isLoading,
    error,
    data: stories,
  } = useQuery({ queryKey: ["stories", userId], queryFn: fetchStories });

  const handleClick = (story) => {
    setSelectedStory(story);
    setOpenModal((prevState) => !prevState);
  };

  return (
    <>
      <div className="stories">
        {/* Add a story */}
        <div className="stories-wrapper">
          <div className="story">
            <LazyLoadImage
              src={
                currentUser?.profilePic
                  ? `/uploads/${currentUser.profilePic}`
                  : defaultProfile
              }
              alt="user"
            />
            <div className="add">Create a story</div>
            <button
              onClick={() => setOpenCreateStory((prevState) => !prevState)}
            >
              +
            </button>
          </div>

          {/* Friends' stories */}
          {error ? (
            <span className="msg">Something went wrong</span>
          ) : isLoading ? (
            <Loader />
          ) : stories?.length === 0 ? (
            <span className="msg">No story to show yet.</span>
          ) : (
            stories?.map((story) => (
              <div
                className="story"
                key={story?.id}
                onClick={() => handleClick(story)}
                style={{ cursor: "pointer" }}
              >
                {isVideo(story?.img) ? (
                  <video>
                    <source
                      src={`/uploads/${story?.img}`}
                      type={`video/${story?.img.split(".").pop()}`}
                    />
                    Your browser doesn't support video.
                  </video>
                ) : (
                  <LazyLoadImage src={`/uploads/${story?.img}`} alt="story" />
                )}

                <span>
                  {story?.firstName} {story?.lastName}
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
        <ModalStory story={selectedStory} setOpenModal={setOpenModal} />
      )}
    </>
  );
}
