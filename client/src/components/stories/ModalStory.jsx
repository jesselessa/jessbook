//**************************** ModalStory.jsx *******************************
// Displays a single story in a modal, handling image/video viewing and deletion
//***************************************************************************

import { useContext } from "react";
import "./modalStory.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { isVideo, getMimeType } from "../../utils/isFile.js";
import { addNonBreakingSpace } from "../../utils/addNonBreakingSpace.js";
import { toast } from "react-toastify";
import moment from "moment";

// Components
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";

// Context
import { AuthContext } from "../../contexts/AuthContext.jsx";

export default function ModalStory({ story, setIsOpen }) {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // Mutation to delete a story
  const deleteMutation = useMutation({
    mutationFn: (storyId) => makeRequest.delete(`/stories/${storyId}`),

    onMutate: async () => {
      await queryClient.cancelQueries(["stories"]);

      const previousStories = queryClient.getQueryData([
        "stories",
        currentUser.id,
      ]);

      // Remove the story optimistically
      queryClient.setQueryData(["stories", currentUser.id], (oldStories = []) =>
        oldStories.filter((s) => s.id !== storyId)
      );

      return { previousStories };
    },

    onError: (error, _story, context) => {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data || error.message);

      if (context?.previousStories) {
        queryClient.setQueryData(
          ["stories", currentUser.id],
          context.previousStories
        );
      }
    },

    onSuccess: () => {
      toast.success("Story deleted.");
      setIsOpen(false); // Close modal
    },

    onSettled: () => queryClient.invalidateQueries(["stories"]),
  });

  const handleDelete = () => {
    deleteMutation.mutate(story.id);
  };

  return (
    <div className="modalStory">
      <div className="modal-content">
        <button className="close" onClick={() => setIsOpen(false)}>
          X
        </button>

        <div className="file-container">
          {isVideo(story.file) ? (
            // Full size video player
            <video controls autoPlay>
              <source
                //! "uploads" is the public web path that is exposed and handled by our web server for static assets
                src={`/uploads/${story.file}`}
                type={getMimeType(story.file)}
              />
              Your browser doesn't support video.
            </video>
          ) : (
            // Full size image viewer
            <LazyLoadImage src={`/uploads/${story.file}`} alt="story" />
          )}
        </div>

        <div className="info-container">
          <h1>{addNonBreakingSpace(story.text)}</h1>

          <div className="story-details">
            <div className="story-edit-info">
              <p>
                Posted by {story.firstName} {story.lastName}
              </p>
              <p>Created {moment(story.createdAt).fromNow()}</p>
            </div>
            {/* Delete button visible only to the story owner */}
            {currentUser?.id === story.userId && (
              <button className="delete" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
