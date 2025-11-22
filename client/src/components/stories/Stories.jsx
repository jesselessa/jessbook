//***************************** Stories.jsx *********************************
// Displays current user and people he follows's stories with optimized video thumbnails based on screen size
//***************************************************************************

import { useContext, useState } from "react";
import "./stories.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { isImage, isVideo, getMimeType } from "../../utils/isFile.js";

// Components
import CreateStory from "./CreateStory.jsx";
import ModalStory from "./ModalStory.jsx";
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";
import Loader from "../loader/Loader.jsx";

// Image
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Context
import { AuthContext } from "../../contexts/AuthContext.jsx";

export default function Stories({ userId }) {
  const { currentUser } = useContext(AuthContext);
  const [isOpenCreateStory, setIsOpenCreateStory] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  // Get stories data
  const fetchStories = async () => {
    try {
      const res = await makeRequest.get(`/stories?userId=${userId}`);
      return res.data;
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  const {
    data: stories,
    isLoading,
    error,
  } = useQuery({
    queryKey: userId ? ["stories", userId] : ["stories", "feed"],
    queryFn: fetchStories,
  });


  // Handler to open the modal with the selected story
  const handleClick = (story) => {
    setSelectedStory(story);
    setIsOpenModal(!isOpenModal);
  };

  return (
    <>
      <div className="stories">
        {/* Stories wrapper */}
        <div className="stories-wrapper">
          {/* "Create a story" entry point */}
          <div className="story">
            <LazyLoadImage
              src={
                currentUser?.profilePic
                  ? //! "uploads" is the public web path that is exposed and handled by our web server for static assets
                  `/uploads/${currentUser.profilePic}`
                  : defaultProfile
              }
              alt="user"
            />
            <div className="add">Create a story</div>
            <button onClick={() => setIsOpenCreateStory(!isOpenCreateStory)}>
              +
            </button>
          </div>

          {/* Display current user's and followed users' stories */}
          {error ? (
            <span className="msg">Something went wrong</span>
          ) : isLoading ? (
            <Loader />
          ) : stories?.length === 0 ? (
            <span className="msg">No story to show yet.</span>
          ) : (
            // Map through and display all available stories
            stories?.map((story) => {
              // 1 - DEFINE THE THUMBNAIL PATH
              // The backend saves the thumbnail as "/uploads/thumbnails/{storyId}.jpg"
              const thumbnailSrc = `/uploads/thumbnails/${story?.id}.jpg`;
              const fileSrc = `/uploads/${story?.file}`;

              return (
                <div
                  className="story"
                  key={story?.id}
                  onClick={() => handleClick(story)}
                  style={{ cursor: "pointer" }}
                >
                  {/* 2 - DISPLAY FILE BASED ON ITS EXTENSION */}
                  {isVideo(story?.file) ? (
                    <video
                      muted
                      loop
                      poster={thumbnailSrc}
                      className="story-video"
                    >
                      <source
                        src={fileSrc} // Use original video path for playback
                        type={getMimeType(story?.file)}
                      />
                      Your browser doesn't support video.
                    </video>
                  ) : (
                    isImage(story?.file) && (
                      // Use original image path
                      <LazyLoadImage
                        className="story-img"
                        src={thumbnailSrc}
                        alt="story"
                      />
                    )
                  )}

                  <span>
                    {story?.firstName} {story?.lastName}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals for creation and viewing */}
      {isOpenCreateStory && <CreateStory setIsOpen={setIsOpenCreateStory} />}
      {isOpenModal && (
        <ModalStory story={selectedStory} setIsOpen={setIsOpenModal} />
      )}
    </>
  );
}
