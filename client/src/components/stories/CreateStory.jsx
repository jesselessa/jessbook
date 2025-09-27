import { useState } from "react";
import "./createStory.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { useCleanUpFileURL } from "../../hooks/useCleanUpFileURL.js";
import { toast } from "react-toastify";

// Components
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";
import Overlay from "../overlay/Overlay.jsx";

// Check if a file is a video based on its MIME type
const isVideo = (fileType) => {
  return /^video\//i.test(fileType);
};

export default function CreateStory({ setOpenCreateStory }) {
  const [file, setFile] = useState(null); // File present or not
  const [text, setText] = useState("");
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
    },

    onError: (error) => console.error("Error creating story:", error),
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

    // Check description length if present
    if (text?.trim()?.length > 45) {
      setError({
        isError: true,
        message: "Description can't contain more than 100\u00A0characters.",
      });
      return;
    }

    // Upload new file if present
    const newFile = file ? await uploadFile(file) : null;

    // Trigger mutation to update database
    mutation.mutate({ file: newFile, text: text.trim() });

    setOpenCreateStory(false); // Close form
    setFile(null); // Reset file state to release URL resource
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const filePath = URL.createObjectURL(selectedFile); // Reset error message every time file changes

    setError({ isError: false, message: "" });

    if (selectedFile) {
      if (isVideo(selectedFile.type)) {
        // If it's a video, store it and update its URL for preview
        setFile(selectedFile);
        setFileURL(filePath);
      } else {
        // If it's an image, store it and update its URL for preview
        setFile(selectedFile);
        setFileURL(filePath);
      }
    }
  };

  // Release URL resource to prevent memory leaks
  useCleanUpFileURL(file);

  return (
    <div className="createStory">
      <div className="wrapper">
        <h1>Create a story</h1>

        <form name="story-form">
          {/* Add an image or a video */}
          <div className="input-group">
            <input
              type="file"
              id="story-file"
              name="story-file"
              accept="image/*, video/*"
              onChange={handleFileChange}
            />
            <label className="file-label" htmlFor="story-file">
              Add an image or a&nbsp;video
            </label>

            {file && (
              <div className="img-container">
                {/* Create a video or an image preview */}
                {isVideo(file.type) ? (
                  <div className="video-placeholder">
                    <p>
                      ✅ Video selected
                      <br />
                      <span>(Preview unavailable)</span>
                    </p>
                  </div>
                ) : (
                  <LazyLoadImage src={fileURL} alt="story preview" />
                )}
              </div>
            )}
          </div>

          <label className="text-label" htmlFor="text">
            Add a text
          </label>
          <textarea
            id="text"
            name="text"
            rows={3}
            maxLength={45}
            placeholder="You can add a short text to your story."
            value={text}
            onChange={(e) => setText(e.target.value)}
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
