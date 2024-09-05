import { useContext } from "react";
import "./modalStory.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";
import { toast } from "react-toastify";
import moment from "moment";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function ModalStory({ story, setOpenModal, onClose }) {
  const { currentUser } = useContext(AuthContext);

  // Delete a story
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    () => makeRequest.delete(`/stories/${story.id}`),
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
      setOpenModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  return (
    <div className="modalStory">
      <div className="modal-content">
        <button className="close" onClick={onClose}>
          X
        </button>

        <div className="img-container">
          <img src={`/uploads/${story.img}`} alt="story" />
        </div>

        <div className="info-container">
          <h1>{story.desc}</h1>

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
    </div>
  );
}
