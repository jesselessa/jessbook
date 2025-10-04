//*************************** Publish.jsx ******************************
// 1. Creates a Post → Only authenticated user (token retrieved from backend)
// 2. Located on 2 places : Timeline (child of Home) and ProfileData (child of Profile)
// 3. Post created displayed, either in Timeline or ProfileData, inside Posts component
//**************************************************************************

import { useContext, useState, useRef } from "react";
import "./publish.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { useCleanUpFileURL } from "../../hooks/useCleanUpFileURL.js";
import { toast } from "react-toastify";

// Components
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";
import Loader from "../loader/Loader.jsx";

// Images
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";
import picture from "../../assets/images/publish/image.png";
import map from "../../assets/images/publish/map.png";
import friends from "../../assets/images/publish/friends.png";

// Contexts
import { AuthContext } from "../../contexts/authContext.jsx";
import { DarkModeContext } from "../../contexts/darkModeContext.jsx";

export default function Publish() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const fileInputRef = useRef(null);

  const [text, setText] = useState("");
  const [image, setImage] = useState(null); // Image selected or not
  const [error, setError] = useState({ isError: false, message: "" });

  const queryClient = useQueryClient();

  // Mutation to create a new post (with optimistic update)
  const mutation = useMutation({
    mutationFn: (newPost) => makeRequest.post("/posts", newPost),

    // OnMutate: Immediately update the cache before the server response
    onMutate: async (newPost) => {
      // Cancel any outgoing fetches for posts query to prevent conflicts
      //? Reminder: cancelQueries(queryKey)
      await queryClient.cancelQueries(["posts"]); // Timeline + ProfileData

      // Store existing query cached data to revert if mutation fails
      //? Reminder: getQueryData(queryKey)
      const previousPosts = queryClient.getQueryData(["posts", currentUser.id]);

      // Create an optimistic post
      //! Note: The optimistic object doesn't have to be identical to the SQL table → It just needs to be complete enough for our UI to display the correct state while waiting for the server response
      //! When the server responds, Tanstack Query reconciles the real data with the cache
      const currentDate = new Date().toISOString();

      const optimisticPost = {
        id: crypto.randomUUID(), // Temporary ID (which will be updated with the real data from server)
        text: newPost.text,
        img: newPost.img,
        createdAt: currentDate, // YYYY-MM-DDTHH:mm:ss.sssZ
      };

      // Optimistically update user's post in cache
      //? Reminder: setQueryData(queryKey, newData)
      //! ⚠️ (oldPost = []) is initialized to an empty array if Tanstack Query has still nothing in cached, otherwise, it could return "undefined" with the error "Cannot read properties of undefined (reading 'Symbol.iterator"
      queryClient.setQueryData(["posts", currentUser.id], (oldPost = []) => [
        ...oldPost,
        optimisticPost,
      ]);

      // Return context with previous data for rollback in case of error
      return { previousPosts };
    },

    // If the mutation fails, rollback the optimistic update
    onError: (error, _newPost, context) => {
      if (import.meta.env.DEV) console.error("Error creating post:", error);
      toast.error("An error occurred while creating post.");

      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(
          ["posts", currentUser.id],
          context.previousPosts
        );
      }
    },

    // If the mutation is successful, display a message
    onSuccess: () => toast.success("Post created."),

    // Either the mutation succeeds or fails, refresh data and reset states
    onSettled: () => {
      // Invalidate queries to refetch fresh
      queryClient.invalidateQueries(["posts"]);
      //! Note: No need to refresh comments and postLikes data because they depend on post ID (and not on post content)

      // Reset states
      setImage(null); // Cleanup local URL
      setText("");

      // Reset input value in DOM (additional safety)
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  // Access the publication state using 'isPending' property from useMutation
  const isPublishing = mutation.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedText = text.trim();

    // Check post length
    if (trimmedText.length === 0) {
      setError({
        isError: true,
        message: "Your post must contain a description.",
      });

      // Display a temporary error message
      setTimeout(() => {
        setError({ isError: false, message: "" });
      }, 3000);

      return;
    }

    if (trimmedText.length > 1000) {
      setError({
        isError: true,
        message: "Your post can't contain more than 1000\u00A0characters.",
      });

      // Temporary error message
      setTimeout(() => {
        setError({ isError: false, message: "" });
      }, 3000);

      return;
    }

    let newImage = null;

    // Upload new image if present
    if (image) {
      newImage = await uploadFile(image);
      try {
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error uploading image:", error);
        setError({
          isError: true,
          message: "An error occured while uploading image.",
        });

        // Temporary error message
        setTimeout(() => {
          setError({ isError: false, message: "" });
        }, 3000);

        return;
      }
    }

    // Trigger mutation to update database
    mutation.mutate({
      text: trimmedText,
      img: newImage,
    });
  };

  // Handle inputs changes
  const handleInputsChange = (e) => {
    // Reset previous error message
    setError({ isError: false, message: "" });

    const { name, value, files } = e.target;
    if (name === "text") {
      setText(value);
    } else {
      setImage(files[0]);
    }
  };

  // Generate a temporary preview URL for selected image file and clean up memory automatically
  const imagePreviewUrl = useCleanUpFileURL(image);

  return (
    <div className="publish">
      <div className="top">
        <div className="left">
          {/* User's profile picture */}
          <div className="img-container">
            <LazyLoadImage
              src={
                // Image uploaded on server or default picture
                currentUser?.profilePic
                  ? `/uploads/${currentUser.profilePic}`
                  : defaultProfile
              }
              alt="user"
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              name="text"
              placeholder={`What's up, ${currentUser?.firstName}\u00A0?`}
              value={text}
              onChange={handleInputsChange}
              autoComplete="off"
              disabled={isPublishing}
            />

            {isPublishing ? (
              <Loader
                width="24px"
                height="24px"
                border="3px solid rgba(0, 0, 0, 0.1)"
              />
            ) : (
              <SendOutlinedIcon
                className={darkMode ? "send dark" : "send"}
                sx={{
                  fontSize: "24px",
                  color: darkMode ? "lightgray" : "#555",
                }}
                onClick={handleSubmit}
              />
            )}
          </div>
        </div>

        <div className="right">
          {/* Image preview */}
          {imagePreviewUrl && (
            <div className="img-container">
              <LazyLoadImage
                src={imagePreviewUrl}
                // Generate a dynamic URL for preview
                alt="post preview"
              />

              <button
                className="close"
                onClick={() => setImage(null)}
                disabled={isPublishing}
              >
                x
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error.isError && <span className="error-msg">{error.message}</span>}

      <hr />

      <div className="bottom">
        <div className="left">
          {/* Add a new image */}
          <label className="file-label-mob" htmlFor="file">
            <LazyLoadImage src={picture} alt="image icon" />
          </label>

          {/* Note: The input:file value linked with state doesn't work, except if it equals "" or "null" */}
          <input
            type="file"
            id="file"
            name="file"
            accept="image/*"
            onChange={handleInputsChange}
            disabled={isPublishing}
            ref={fileInputRef}
          />

          <div className="add-img">
            <LazyLoadImage src={picture} alt="image icon" />
            <label className="file-label" htmlFor="file">
              <span>Add Image</span>
            </label>
          </div>

          <div className="item">
            <LazyLoadImage src={map} alt="map icon" />
            <span>Add Place</span>
          </div>

          <div className="item">
            <LazyLoadImage src={friends} alt="friends icon" />
            <span>Tag Friends</span>
          </div>
        </div>

        <div className="right">
          <button type="submit" onClick={handleSubmit} disabled={isPublishing}>
            {isPublishing ? (
              <Loader
                width="20px"
                height="20px"
                border="2px solid rgba(0, 0, 0, 0.1)"
              />
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
