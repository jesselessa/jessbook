import { useState, useEffect } from "react";
import "./createStory.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { makeRequest } from "../../utils/axios.js";
import { upload } from "../../utils/upload.js";

// Component
import Overlay from "../overlay/Overlay.jsx";

// Utility function checking if file is a video based on the name of its "type" attribute
//! A regex must always return a value (true or false)
const isVideo = (type) => type.startsWith("video/");

export default function CreateStory({ setOpenCreateStory }) {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [error, setError] = useState({ isError: false, message: "" });
  const [imgURL, setImgURL] = useState("");
  const [videoURL, setVideoURL] = useState("");

  // Add a new story
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newStory) => {
      return makeRequest.post("/stories", newStory);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["stories"]);

        setOpenCreateStory(false); // To close form
        toast.success("Story published.");
      },
    }
  );

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

    // Reset error message
    setError({ isError: false, message: "" });

    // Reset inputs after submission
    setFile(null);
    setDesc("");

    // Initialize variable, then, upload file and download URL
    let fileUrl = "";

    if (file) fileUrl = await upload(file);

    mutation.mutate({ img: fileUrl, desc: desc }); // If success URL sent to database (stories table)
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Reset error everytime file changes
    setError({ isError: false, message: "" });

    // Check video duration not exceeds 60 seconds
    if (selectedFile) {
      if (isVideo(selectedFile.type)) {
        const videoElement = document.createElement("video");

        const fileURL = URL.createObjectURL(selectedFile); // Generate dynamic URL for selected file

        videoElement.src = fileURL;

        videoElement.onloadedmetadata = () => {
          // loadedmetadata event is fired when metadata has been loaded
          if (videoElement.duration > 60) {
            // Failed upload
            setError({
              isError: true,
              message: "You can't publish a video exceeding 60 seconds.",
            });

            setFile(null);
            setVideoURL(""); // Clear video URL to prevent preview
            return;
          } else {
            // Successful upload : store file and update its URL
            setFile(selectedFile);
            setVideoURL(fileURL);
          }
        };
      } else {
        // If uploaded file is an image, store it and update its URL
        setFile(selectedFile);

        const imgPath = URL.createObjectURL(selectedFile);
        setImgURL(imgPath);
      }
    }
  };

  // Cleanup function inside useEffect to release URL resources when component is unmounted or URLs change
  useEffect(() => {
    return () => {
      if (videoURL) URL.revokeObjectURL(videoURL);
      if (imgURL) URL.revokeObjectURL(imgURL);
    };
  }, [videoURL, imgURL]);

  return (
    <div className="createStory">
      <div className="wrapper">
        <h1>Create a story</h1>

        <form>
          {/* Add an image or a video */}
          <div className="input-group">
            <label htmlFor="file">
              {/* input: file - value linked with state "file" doesn't work except if value equals "" or "null" */}
              <input
                type="file"
                id="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              Add an image or a video
            </label>

            {file && (
              <div className="img-container">
                {isVideo(file?.type) ? (
                  <video
                  // 'controls' and 'type' attributes not needed
                  >
                    <source
                      src={
                        URL.createObjectURL(file) // Creates a fake URL for file preview
                      }
                    />
                    Your browser doesn't support video.
                  </video>
                ) : (
                  <img alt="image" src={URL.createObjectURL(file)} />
                )}
              </div>
            )}
          </div>

          <textarea
            id="desc"
            name="desc"
            type="text"
            rows={3}
            placeholder="You can add a short description to your post."
            maxLength={100}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <button type="submit" onClick={handleClick}>
            Publish
          </button>
        </form>

        {/* Error message */}
        {error.isError && <span className="errorMsg">{error.message}</span>}

        <button className="close" onClick={() => setOpenCreateStory(false)}>
          X
        </button>
      </div>

      <Overlay />
    </div>
  );
}
