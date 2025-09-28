//***************************** Stories.jsx *********************************
//* Displays user and friends' stories with optimized video thumbnails based on screen size
// - local file on user's device
// - thumbnail can be generated client-side from the local file (blob URL)
// - tools needed : JavaScript/Canvas API or custom librairies
//****************************************************************************

import { useContext, useState, useEffect } from "react";
import "./stories.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { isImage, isVideo } from "../../utils/isFile.js";

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
  const [selectedStory, setSelectedStory] = useState(null); // State to detect small screen size (e.g., mobile)
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);

  // Hook to detect screen resize and update isSmallScreen state
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 600);
    };
    // Set up the event listener
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Get stories data
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

  // Handler to open the modal with the selected story
  const handleClick = (story) => {
    setSelectedStory(story);
    setOpenModal((prevState) => !prevState);
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
            <button
              onClick={() => setOpenCreateStory((prevState) => !prevState)}
            >
              +
            </button>
          </div>

          {/* Display user and friends' stories */}
          {error ? (
            <span className="msg">Something went wrong</span>
          ) : isLoading ? (
            <Loader />
          ) : stories?.length === 0 ? (
            <span className="msg">No story to show yet.</span>
          ) : (
            // Map through and display all available stories
            stories?.map((story) => (
              <div
                className="story"
                key={story?.id}
                onClick={() => handleClick(story)}
                style={{ cursor: "pointer" }}
              >
                {isVideo(story?.file) ? (
                  // CONDITIONAL VIDEO RENDERING
                  isSmallScreen ? (
                    // SMALL SCREEN: Show only a thumbnail/image to save resources
                    <LazyLoadImage
                      src={`/uploads/${story?.file}`}
                      alt="story video thumbnail"
                    />
                  ) : (
                    // LARGE SCREEN: Show video tag (muted and loop for non-intrusive preview)
                    <video controls poster>
                      <source
                        src={`/uploads/${story?.file}`} // If it's a MOV extension (iOS), use quicktime as MIME type for compatibility
                        type={
                          story?.file.toLowerCase().endsWith(".mov")
                            ? "video/quicktime"
                            : `video/${story?.file.split(".").pop()}`
                        }
                      />
                      Your browser doesn't support video.
                    </video>
                  )
                ) : (
                  isImage(story?.file) && (
                    // Image story
                    <LazyLoadImage
                      src={`/uploads/${story?.file}`}
                      alt="story"
                    />
                  )
                )}
                <span>
                  {story?.firstName} {story?.lastName}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals for creation and viewing */}
      {openCreateStory && (
        <CreateStory setOpenCreateStory={setOpenCreateStory} />
      )}
      {openModal && (
        <ModalStory story={selectedStory} setOpenModal={setOpenModal} />
      )}
    </>
  );
}
