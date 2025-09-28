//************************** CreateStory.jsx ******************************
//* File currently being selected
// - file already uploaded on the server
// - server can be configured to generate a thumbnail and make it available
// - no tool needed : the server manages/stores the thumbnail

//* Client-side video duration check implemented
//*************************************************************************

import { useState, useEffect } from "react";
import "./createStory.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { useCleanUpFileURL } from "../../hooks/useCleanUpFileURL.js";
import { toast } from "react-toastify";

// Components
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";
import Overlay from "../overlay/Overlay.jsx";

// Utility function to check if a file is a video based on its MIME type
const isVideo = (fileType) => {
  return /^video\//i.test(fileType);
};

// Maximum allowed video duration (in seconds, must match backend validation)
const MAX_DURATION_SECONDS = 60;

// Component to load video metadata and check its duration
const VideoDurationChecker = ({ fileURL, onDurationCheck }) => {
  // onDurationCheck is a callback function passed from parent (CreateStory) to child (VideoDurationChecker)
  // In this component that actually loads the video, it returns the result of its check (success or failure, along with the exact duration) to the parent component, which manages the global state
  return (
    // We use a hidden <video> element to trigger metadata loading
    <video
      src={fileURL} // We set height/width to 0 and hide it to prevent rendering issues
      style={{
        position: "absolute",
        opacity: 0,
        pointerEvents: "none",
        width: 0,
        height: 0,
      }}
      onLoadedMetadata={(e) => {
        const duration = e.target.duration;
        const isValid = duration <= MAX_DURATION_SECONDS;
        onDurationCheck(isValid, duration);
      }}
    />
  );
};

//*----------------------------- Blob URL ---------------------------------
// Blob URLs are dynamically generated URLs (Uniform Resource Locators) that allow access to binary data stored in a Blob (Binary Large OBject) object in JavaScript

// A Blob object can contain data of various types, such as images, audio or video files, text, or any other type of binary data

// It's a useful and flexible technique for manipulating pseudo-files in memory, which do not exist as such on a web server
//*------------------------------------------------------------------------

export default function CreateStory({ setOpenCreateStory }) {
  const [file, setFile] = useState(null); // File present or not
  const [text, setText] = useState(""); // Story description text
  const [fileURL, setFileURL] = useState(""); // Local URL for file preview (URL.createObjectURL) => It's a Blob URL
  const [error, setError] = useState({ isError: false, message: "" });
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);
  const [tempVideoFile, setTempVideoFile] = useState(null); // Holds video while duration is checked
  const [isCheckingDuration, setIsCheckingDuration] = useState(false); // Loading state
  const [videoDuration, setVideoDuration] = useState(null); // Stores final duration (if valid)

  const queryClient = useQueryClient();

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

  // Mutation to create a story
  const mutation = useMutation({
    mutationFn: (newStory) => makeRequest.post("/stories", newStory),

    onSuccess: (data) => {
      // "data" contains the response from the server
      // The server response should contain the message and the new storyId
      const newStoryId = data.storyId;

      // Invalidate and refetch
      queryClient.invalidateQueries(["stories"]);
      toast.success("Story published.");

      // Reset states after successful submission
      setOpenCreateStory(false);
      setFile(null);
    },

    onError: (error) => console.error("Error creating story:", error),
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // 1 - Check if duration check is still pending
    if (isCheckingDuration) {
      setError({
        isError: true,
        message: "Please wait for video duration check to complete.",
      });
      return;
    }

    // 2 - Check if a file is actually selected (passed validation)
    if (!file) {
      setError({
        isError: true,
        message: "You must select an image or a video file.",
      });
      return;
    }

    // 3 - Check description length
    if (text?.trim()?.length > 45) {
      setError({
        isError: true,
        message: "Description can't contain more than 45\u00A0characters.",
      });
      return;
    }

    // 4 - If it's a video, ensure client-side validation passed (redundant but safe)
    if (isVideo(file.type) && videoDuration > MAX_DURATION_SECONDS) {
      setError({
        isError: true,
        message: `Video duration (${videoDuration.toFixed(
          1
        )}s) exceeds the 60 seconds limit.`,
      });
      return;
    }

    // 5 - Only upload the valid file to the server
    const newFile = await uploadFile(file);
    if (!newFile) return; // Code stops here
    // Note : newFile is a string ("fileName.extension")

    // 6 - Trigger a mutation to update database
    mutation.mutate({ file: newFile, text: text.trim() });
  };

  // Handler for the result of the video duration check
  const handleDurationCheck = (isValid, duration) => {
    setIsCheckingDuration(false);

    // Clean up the temporary URL immediately after metadata is loaded
    URL.revokeObjectURL(fileURL);

    if (isValid) {
      // SUCCESS: Store the file in the actual 'file' state and the duration
      setFile(tempVideoFile);
      setVideoDuration(duration);
      setFileURL(URL.createObjectURL(tempVideoFile)); // Recreate URL for preview if needed
    } else {
      // ERROR: Show error message
      setError({
        isError: true,
        message: `Video duration (${duration.toFixed(
          1
        )}s) exceeds the 60 seconds limit.`,
      });

      // Clear all file states related to the invalid file
      setFile(null);
      setVideoDuration(null);
      setFileURL("");
    }

    setTempVideoFile(null); // Clear temp state regardless of outcome
  };

  // Handler when a file is selected
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Reset all states for a new selection
    setError({ isError: false, message: "" });
    setFile(null);
    setFileURL("");
    setVideoDuration(null);

    if (selectedFile) {
      const filePath = URL.createObjectURL(selectedFile); // Temp URL for checker

      if (isVideo(selectedFile.type)) {
        // VIDEO: Store file temporarily, set temp URL, and start duration check
        setIsCheckingDuration(true);
        setTempVideoFile(selectedFile);
        setFileURL(filePath); // This URL will be used by the hidden checker component
      } else {
        // IMAGE: Store file and set URL immediately (no duration check needed)
        setFile(selectedFile);
        setFileURL(filePath);
      }
    }
  };

  // Custom hook to release the local URL resource when component unmounts or file changes to prevent memory leaks
  useCleanUpFileURL(file);

  return (
    <div className="createStory">
      <div className="wrapper">
        <h1>Create a story</h1>
        {/* RENDER THE DURATION CHECKER IF A TEMP VIDEO EXISTS */}       
        {tempVideoFile && isCheckingDuration && (
          <VideoDurationChecker
            fileURL={fileURL}
            onDurationCheck={handleDurationCheck}
          />
        )}
        <form name="story-form">
          {/* Add an image or a video */}
          <div className="input-group">
            <input
              type="file"
              id="story-file"
              name="story-file"
              accept="image/*, video/*"
              onChange={handleFileChange} // Disable input while checking duration
              disabled={isCheckingDuration}
            />
            <label className="file-label" htmlFor="story-file">
              Add an image or a&nbsp;video
            </label>
            {/* Show preview if a file is successfully loaded or if checking duration is active */}
            {(file || isCheckingDuration) && (
              <div className="file-container">
                {/* Create a video or an image preview */}     
                {isCheckingDuration ? (
                  // Display loading state while checking duration
                  <div className="video-placeholder">
                    <p>⏳ Checking video duration...</p>   
                  </div>
                ) : isVideo(file?.type) ? (
                  // Video selected AND validated
                  isSmallScreen ? (
                    // SMALL SCREEN: Show placeholder with duration
                    <div className="video-placeholder">
                      <p>
                        ✅ Video Selected ({videoDuration?.toFixed(1)}s)
                        <br />
                        <span>(Preview unavailable on small screens)</span>
                      </p>
                    </div>
                  ) : (
                    // LARGE SCREEN: Show actual video preview
                    <div className="video-container">
                      <video controls autoPlay muted>
                        {/* Use the local fileURL for immediate client-side preview */}
                        <source src={fileURL} type={file.type} />
                        Your browser doesn't support video preview.
                      </video>
                    </div>
                  )
                ) : (
                  // Image Preview
                  <div className="img-container">
                    <LazyLoadImage src={fileURL} alt="story preview" />
                  </div>
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
            {isCheckingDuration ? "Checking Duration..." : "Publish"}
          </button>
        </form>
        {/* Error message display */}
        {error.isError && <span className="error-msg">{error.message}</span>}   
        <button className="close" onClick={() => setOpenCreateStory(false)}>
          X
        </button>
      </div>
      <Overlay />
    </div>
  );
}
