import { useContext } from "react";
import "./modalStory.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { toast } from "react-toastify";
import moment from "moment";

// Utility function checking if file is a video based on its extension
//! A regex must always return a value (true or false)
const isVideo = (fileName) =>
  /\.(mp4|mov|avi|mkv|webm|flv|wmv|3gp|m4v|ogv)$/i.test(fileName);

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function ModalStory({ story, toggleOpenModal }) {
  const { currentUser } = useContext(AuthContext);

  // Delete a story
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    () => makeRequest.delete(`/stories/${story?.id}`),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["stories"]);
        toast.success("Story deleted.");
      },
    }
  );

  const handleDelete = () => {
    try {
      deleteMutation.mutate(story.id);
      toggleOpenModal();
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  return (
    <div className="modalStory">
      <div className="modal-content">
        <button className="close" onClick={toggleOpenModal}>
          X
        </button>

        <div className="img-container">
          {isVideo(story?.img) ? (
            <video controls>
              <source
                src={`/uploads/${story?.img}`}
                type={`video/${story?.img.split(".").pop()}`}
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img src={`/uploads/${story?.img}`} alt="preview" />
          )}
        </div>

        <div className="info-container">
          <h1>{story?.desc}</h1>

          <div className="story-details">
            <div className="story-edit-info">
              <p>
                Posted by {story?.firstName} {story?.lastName}
              </p>
              <p>Created {moment(story?.createdAt).fromNow()}</p>
            </div>

            {currentUser?.id === story?.userId && (
              <button className="delete" onClick={() => handleDelete(story.id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
