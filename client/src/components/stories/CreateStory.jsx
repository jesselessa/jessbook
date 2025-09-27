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
        // 1 - Trigger immediate preview to fix mobile blocking issues
        // This displays the video while the metadata validation runs asynchronously
        setFile(selectedFile);
        setFileURL(filePath);

        const video = document.createElement("video");
        video.src = filePath;

        // 2 - Start asynchronous duration validation (non-blocking)
        // Handle loading errors if metadata cannot be read
        video.addEventListener("error", () => {
          setError({
            isError: true,
            message:
              "Error loading video file metadata. Please try a different format.",
          });
          setFile(null);
          setFileURL("");
        });

        video.addEventListener("loadedmetadata", () => {
          // Check duration after metadata is loaded
          if (video.duration > 60) {
            // Invalid video : reject the file after initial display
            setError({
              isError: true,
              message: "Video duration can't exceed 60\u00A0seconds.",
            });
            setFile(null); // Unselect file
            setFileURL(""); // Clear URL to remove preview
          }
          // If valid, the file is already set in step 1
        });
      } else {
        // If the uploaded file is an image, store it and update its URL for preview
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
