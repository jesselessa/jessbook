import { useContext } from "react";
import "./modalStory.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { isVideo } from "../../utils/isVideo.js";
import { addNonBreakingSpace } from "../../utils/addNonBreakingSpace.js";
import { toast } from "react-toastify";
import moment from "moment";

// Components
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";
import Overlay from "../overlay/Overlay.jsx";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function ModalStory({ story, setOpenModal }) {
  const { currentUser } = useContext(AuthContext);

  const queryClient = useQueryClient();

  // Delete a story
  const deleteMutation = useMutation({
    mutationFn: () => makeRequest.delete(`/stories/${story.id}`),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["stories"]);
      toast.success("Story deleted.");
    },
  });

  const handleDelete = () => {
    try {
      deleteMutation.mutate(story.id);
      setOpenModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  return (
    <div className="modalStory">
      <div className="modal-content">
        <button className="close" onClick={() => setOpenModal(false)}>
          X
        </button>

        <div className="img-container">
          {isVideo(story.img) ? (
            <video controls autoPlay>
              <source
                src={`/uploads/${story.img}`}
                type={`video/${story.img.split(".").pop()}`}
              />
              Your browser doesn't support video.
            </video>
          ) : (
            <LazyLoadImage src={`/uploads/${story.img}`} alt="story" />
          )}
        </div>

        <div className="info-container">
          <h1>{addNonBreakingSpace(story.desc)}</h1>

          <div className="story-details">
            <div className="story-edit-info">
              <p>
                Posted by {story.firstName} {story.lastName}
              </p>
              <p>Created {moment(story.createdAt).fromNow()}</p>
            </div>

            {currentUser.id === story.userId && (
              <button className="delete" onClick={() => handleDelete(story.id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <Overlay />
    </div>
  );
}
