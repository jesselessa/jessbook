import { useState } from "react";
import "./createStory.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { toast } from "react-toastify";

// Components
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";
import Overlay from "../overlay/Overlay.jsx";

// Check if a file is a video based on its MIME type
const isVideo = (fileType) => {
  return /^video\//i.test(fileType);
};

export default function CreateStory({ setOpenCreateStory }) {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [error, setError] = useState({ isError: false, message: "" });

  const queryClient = useQueryClient();

  // Create a new story
  const mutation = useMutation({
    mutationFn: (newStory) => makeRequest.post("/stories", newStory),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["stories"]);
      toast.success("Story published.");

      setOpenCreateStory(false); // Close form
    },

    onError: (error) => {
      toast.error("Error creating story.");
      throw new Error(error);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // Check if image or video selected
    if (!file) {
      setError({
        isError: true,
        message: "You can't edit a story without an image or a video.",
      });

      return;
    }

    // Upload new file if present
    const newFile = file ? await uploadFile(file) : null;

    // Trigger mutation to update database
    mutation.mutate({ img: newFile, desc: desc });

    // Reset file state to release URL resources
    setFile(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const filePath = URL.createObjectURL(selectedFile);

    // Reset error message everytime file changes
    setError({ isError: false, message: "" });

    // Check video duration
    if (selectedFile) {
      if (isVideo(selectedFile.type)) {
        const video = document.createElement("video");

        video.src = filePath;

        video.addEventListener("loadedmetadata", () => {
          // 'loadedmetadata' event is fired when metadata has been loaded
          if (video.duration > 60) {
            // Unvalid video
            setError({
              isError: true,
              message: "Video duration can't exceed a 60-second limit.",
            });

            setFile(null); // Unselect file
            setFileURL(""); // No URL for preview

            return;
          } else {
            // Valid video
            setFile(selectedFile);
            setFileURL(filePath);
          }
        });
      } else {
        // If uploaded file is an image, store it and update its URL
        setFile(selectedFile);
        setFileURL(filePath);
      }
    }
  };

  return (
    <div className="createStory">
      <div className="wrapper">
        <h1>Create a story</h1>

        <form name="story-form">
          {/* Add an image or a video */}
          <div className="input-group">
            <input
              type="file"
              id="file"
              name="file"
              accept="image/*, video/*"
              onChange={handleFileChange}
            />
            <label className="file-label" htmlFor="file">
              Add an image or a video
            </label>

            {file && (
              <div className="img-container">
                {/* Create a video or an image preview */}
                {isVideo(file.type) ? (
                  <video>
                    <source src={fileURL} type={file.type} />
                    Your browser doesn't support video.
                  </video>
                ) : (
                  <LazyLoadImage src={fileURL} alt="story preview" />
                )}
              </div>
            )}
          </div>

          <label className="desc-label" htmlFor="desc">
            Add a text
          </label>
          <textarea
            id="desc"
            name="desc"
            rows={3}
            placeholder="You can add a short description to your story."
            maxLength={100}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <button type="submit" onClick={handleClick}>
            Publish
          </button>
        </form>

        {/* Error message */}
        {error.isError && <span className="error-msg">{error.message}</span>}

        <button className="close" onClick={() => setOpenCreateStory(false)}>
          X
        </button>
      </div>

      <Overlay />
    </div>
  );
}
