//*************************** CreateStory.jsx ******************************
// 1. Handles file currently being selected
// 2. Implements video duration check client-side
//**************************************************************************

import { useContext, useState, useEffect } from "react";
import "./createStory.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { isVideo, getMimeType } from "../../utils/isFile.js";
import { useCleanUpFileURL } from "../../hooks/useCleanUpFileURL.js";
import { toast } from "react-toastify";

import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";
import Loader from "../loader/Loader.jsx";

// Context
import { AuthContext } from "../../contexts/AuthContext.jsx";

// Maximum allowed video duration in seconds (must match backend validation)
const MAX_DURATION_SECONDS = 60;

// Component to load video metadata and check its duration
const VideoDurationChecker = ({ fileURL, onDurationCheck }) => {
  // We use a hidden <video> element to trigger metadata loading
  return (
    <video
      src={fileURL}
      // We set height/width to 0 and hide it to prevent rendering issues
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        opacity: 0,
        pointerEvents: "none",
      }}
      onLoadedMetadata={(e) => {
        const duration = e.target.duration;
        const isValid = duration <= MAX_DURATION_SECONDS;
        const isNotValid = duration > MAX_DURATION_SECONDS;
        onDurationCheck(isValid || isNotValid, duration); // Callback to parent with duration result

        // onDurationCheck(isValid, duration); // Callback to parent with duration result
      }}
    />
  );
};

export default function CreateStory({ setIsOpen }) {
  const { currentUser } = useContext(AuthContext);

  const [file, setFile] = useState(null); // File selected (image or video)
  const [text, setText] = useState(""); // Story description
  const [tempFileUrl, setTempFileUrl] = useState(""); // Temporary URL for preview or duration checking
  const [tempVideoFile, setTempVideoFile] = useState(null); // Temporary video file while duration is checked
  const [isCheckingDuration, setIsCheckingDuration] = useState(false); // Video loading state
  const [videoDuration, setVideoDuration] = useState(null); // Stores final video duration (if valid)
  const [error, setError] = useState({ isError: false, message: "" });
  // Make the component responsive without depending on global state
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);

  const queryClient = useQueryClient();

  // Cleanup URL automatically
  //! ⚠️ Although the final file URL is managed by the hook based on the 'file' state, we use the local state 'tempFileUrl' for the preview because the video logic is complex
  const previewUrl = useCleanUpFileURL(file);

  // Detect window resize to switch between small/large screen UI
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Optimistic mutation for creating a story
  const mutation = useMutation({
    mutationFn: ({ file, text }) =>
      makeRequest.post("/stories", { file, text }),

    onMutate: async ({ file, text }) => {
      await queryClient.cancelQueries(["stories", "feed"]);
      await queryClient.cancelQueries(["stories", currentUser.id]);

      const previousFeedStories = queryClient.getQueryData(["stories", "feed"]);
      const previousUserStories = queryClient.getQueryData([
        "stories",
        currentUser.id,
      ]);

      // Optimistic story object
      const currentDate = new Date();
      const twentyFourHoursInMs = 24 * 60 * 60 * 1000; // 24h * 60 min/h * 60 sec/min * 1000 ms/sec
      const expirationDate = new Date(
        currentDate.getTime() + twentyFourHoursInMs
      ).toISOString();

      const optimisticStory = {
        id: crypto.randomUUID(),
        file,
        text,
        createdAt: currentDate,
        expiresAt: expirationDate,
      };

      queryClient.setQueryData(["stories", currentUser.id], (oldStory = []) => [
        ...oldStory,
        optimisticStory,
      ]);

      return { previousFeedStories, previousUserStories };
    },

    onError: (error, _variables, context) => {
      console.error(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message);

      if (context?.previousFeedStories) {
        queryClient.setQueryData(
          ["stories", "feed"],
          context.previousFeedStories
        );
      }

      if (context?.previousUserStories) {
        queryClient.setQueryData(
          ["stories", currentUser.id],
          context.previousUserStories
        );
      }
    },

    onSuccess: () => {
      toast.success("Story published.");
      setIsOpen(false);
    },

    onSettled: () => {
      queryClient.invalidateQueries(["stories", "feed"]);
      queryClient.invalidateQueries(["stories", currentUser.id]);

      // Reset states
      setFile(null);
      setText("");
      setError({ isError: false, message: "" });
      setTempFileUrl("");
      setTempVideoFile("");
      setIsCheckingDuration(false);
      setVideoDuration(null);
    },
  });

  const isPublishing = mutation.isPending;

  // Handle video duration check callback
  const handleDurationCheck = (isValid, duration) => {
    setIsCheckingDuration(false);

    // Clean up the temporary URL immediately after metadata is loaded
    if (tempFileUrl) URL.revokeObjectURL(tempFileUrl);

    if (isValid || isNotValid) {
      // SUCCESS: Store the file in the actual 'file' state and the duration
      setFile(tempVideoFile);
      setVideoDuration(duration);
    } else {
      // ERROR: Show error message
      setError({
        isError: true,
        message: `Video duration (${duration.toFixed(
          1
        )}s) exceeds ${MAX_DURATION_SECONDS}s.`,
      });
      // Clear all file states related to the invalid file
      setFile(null); // Keep preview if video exceeds limit duration
      setVideoDuration(null);
    }

    // if (isValid) {
    //   // SUCCESS: Store the file in the actual 'file' state and the duration
    //   setFile(tempVideoFile);
    //   setVideoDuration(duration);
    // } else {
    //   // ERROR: Show error message
    //   setError({
    //     isError: true,
    //     message: `Video duration (${duration.toFixed(
    //       1
    //     )}s) exceeds ${MAX_DURATION_SECONDS}s.`,
    //   });
    //   // Clear all file states related to the invalid file
    //   setFile(null); // Keep preview if video exceeds limit duration
    //   setVideoDuration(null);
    // }

    // Clear states regardless of outcome
    setTempVideoFile(null);
    setTempFileUrl("");
  };

  // Handle file selection
  const handleFileChange = (e) => {
    // Reset error message
    setError({ isError: false, message: "" });

    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const filePath = URL.createObjectURL(selectedFile);

      if (isVideo(selectedFile.name)) {
        // VIDEO: Store file temporarily, set temp URL, and start duration check
        setIsCheckingDuration(true);
        setTempVideoFile(selectedFile);
        setTempFileUrl(filePath); // URL used for duration checking
      } else {
        // IMAGE: Store file and set URL immediately
        setFile(selectedFile);
        setTempFileUrl(filePath);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1 - Check if a file (either image or video) is actually selected
    if (!file) {
      setError({
        isError: true,
        message: "You must select an image or video file.",
      });
      return;
    }

    // 2 - Check story description length
    if (text?.trim().length > 45) {
      setError({
        isError: true,
        message: "Description can't exceed 45 characters.",
      });
      return;
    }

    // 3 – Check additional requirements for video file
    if (isVideo(file.name)) {
      // 3A - Check if duration check is still pending
      if (isCheckingDuration) {
        setError({
          isError: true,
          message: "Please wait for video duration check to complete.",
        });
        return;
      }

      // 3B - Check video duration
      if (videoDuration > MAX_DURATION_SECONDS) {
        setError({
          isError: true,
          message: `Video duration (${videoDuration.toFixed(
            1
          )}s) exceeds the 60\u00A0seconds limit. Choose another file.`,
        });
        return;
      }
    }

    // 4. Prevent double submission
    if (isPublishing) return;

    try {
      // 5 - Upload the valid file to the server
      // Note: uploadedFile is a string ("fileName.extension")
      const uploadedFile = file && (await uploadFile(file));

      // 6 - UPLOAD FAILURE : Display error message
      if (!uploadedFile) {
        setError({ isError: true, message: "File upload failed." });
        return;
      }

      // 7 - Trigger mutation
      mutation.mutate({
        file: uploadedFile,
        text: text.trim(),
      });
    } catch (error) {
      console.error(error);
      setError({
        isError: true,
        message: error.response?.data?.message || error.message,
      });
    }
  };

  const currentPreviewUrl = file ? previewUrl : tempFileUrl;

  return (
    <div className="createStory">
      <div className="wrapper">
        <h1>Create a story</h1>

        {/* Render duration checker if temporary video exists */}
        {tempVideoFile && isCheckingDuration && (
          <VideoDurationChecker
            fileURL={tempFileUrl}
            onDurationCheck={handleDurationCheck}
          />
        )}

        <form name="story-form" onSubmit={handleSubmit}>
          <div className="input-group">
            {/* Add image or video */}
            <input
              type="file"
              id="story-file"
              name="story-file"
              accept="image/*, video/*"
              onChange={handleFileChange}
              disabled={isCheckingDuration || isPublishing}
            />
            <label className="file-label" htmlFor="story-file">
              Add an image or a&nbsp;video
            </label>

            {/* Show preview if a file is successfully loaded OR if duration check is active */}
            {(file || isCheckingDuration) && currentPreviewUrl && (
              <div className="file-container">
                {isCheckingDuration ? (
                  // STATE 1: Loading while checking video duration
                  <div className="video-placeholder">
                    <p>⏳ Checking video duration</p>
                    <Loader
                      width="20px"
                      height="20px"
                      border="2px solid rgba(0,0,0,0.1)"
                    />
                  </div>
                ) : // STATE 2: Valid video selected
                  isVideo(file?.name) ? (
                    // Small screen
                    isSmallScreen ? (
                      <div className="video-placeholder">
                        <p>
                          ✅ Video Selected ({videoDuration?.toFixed(1)}s)
                          <br />
                          <span>(Preview unavailable)</span>
                        </p>
                      </div>
                    ) : (
                      // Larger screen
                      <div className="video-container">
                        <video controls autoPlay muted>
                          <source
                            src={currentPreviewUrl}
                            type={getMimeType(file.name)}
                          />
                          Your browser doesn't support video preview.
                        </video>
                      </div>
                    )
                  ) : (
                    // STATE 3: Valid image selected
                    <div className="img-container">
                      <LazyLoadImage
                        src={currentPreviewUrl}
                        alt="story preview"
                      />
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
            placeholder="You can add a short text to your story."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isPublishing}
          />

          <button disabled={isPublishing}>
            {isPublishing ? (
              <Loader
                width="24px"
                height="24px"
                border="3px solid rgba(0,0,0,0.1)"
              />
            ) : (
              "Publish"
            )}
          </button>
        </form>

        {/* Display error message */}
        {error.isError && <div className="error-msg">{error.message}</div>}

        <button
          className="close"
          onClick={() => setIsOpen(false)}
          disabled={isPublishing}
        >
          X
        </button>
      </div>
    </div>
  );
}
