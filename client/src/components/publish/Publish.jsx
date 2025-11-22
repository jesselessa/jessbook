//*************************** Publish.jsx *********************************
// 1. Creates a Post → Only authenticated user (token retrieved from backend)
// 2. Located on 2 places : Timeline (child of Home) and ProfileData (child of Profile)
// 3. Post created displayed, either in Timeline or ProfileData, inside Posts component
//**************************************************************************

import { useContext, useState } from "react";
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
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { DarkModeContext } from "../../contexts/DarkModeContext.jsx";

export default function Publish() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const [text, setText] = useState("");
  const [image, setImage] = useState(null); // Image selected or not
  const [error, setError] = useState({ isError: false, message: "" });

  const queryClient = useQueryClient();

  // Generate a temporary preview URL for selected image file and clean up memory automatically
  const imagePreviewUrl = useCleanUpFileURL(image);

  // Mutation to create a new post (with optimistic update)
  const mutation = useMutation({
    mutationFn: async ({ text, img }) => {
      const res = await makeRequest.post("/posts", { text, img });
      return res.data;
    },

    // 1. onMutate: Immediately update the cache before the server response
    onMutate: async ({ text, img }) => {
      // 1A. Cancel any outgoing queries for posts
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["posts", currentUser.id] });

      // 1B. Store current cached data for rollback if mutation fails
      const previousPostsGlobal = queryClient.getQueryData(["posts"]) || [];
      const previousPostsUser =
        queryClient.getQueryData(["posts", currentUser.id]) || [];

      // 1C. Create a temporary optimistic post
      //! ⚠️ The optimistic object doesn't have to be identical to the SQL table → It just needs to be complete enough for our UI to display the correct state while waiting for the server response
      //! When the server responds, Tanstack Query reconciles the real data with the cache
      const currentDate = new Date();

      const optimisticPost = {
        id: crypto.randomUUID(), // Temporary ID
        text,
        img,
        createdAt: currentDate.toISOString(), // YYYY-MM-DDTHH:mm:ss.sssZ
        // We add the current user data retrieved server side via a SQL JOIN combining 'posts' and 'users' tables
        userId: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        profilePic: currentUser.profilePic,
      };

      // 1D. Optimistically remove the post from both global and user's caches
      //! ⚠️ We must set an empty array as a fallback (oldPost = []), otherwise, if Tanstack Query has still nothing in cache, it will return 'undefined', making our app crash
      queryClient.setQueryData(["posts"], (oldPost = []) => [
        ...oldPost,
        optimisticPost,
      ]);
      queryClient.setQueryData(["posts", currentUser.id], (oldPost = []) => [
        ...oldPost,
        optimisticPost,
      ]);

      // 1E. Return context with previous data for rollback in case of error
      return { previousPostsGlobal, previousPostsUser };
    },

    // 2. onError (mutation failed), Rollback the optimistic update
    onError: (error, _variables, context) => {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);

      // Rollback on error
      if (context?.previousPostsGlobal) {
        queryClient.setQueryData(["posts"], context.previousPostsGlobal);
      }
      if (context?.previousPostsUser) {
        queryClient.setQueryData(
          ["posts", currentUser.id],
          context.previousPostsUser
        );
      }
    },

    // If the mutation is successful, display a message
    onSuccess: () => toast.success("Post created."),

    // Either the mutation succeeds or fails, refresh data and reset states
    onSettled: () => {
      // Invalidate queries to refetch all posts from the server
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["posts", currentUser.id]); //! Note: No need to refresh comments and postLikes data because they depend on post ID (and not on post content)

      // Reset states
      setText("");
      setImage(null);
    },
  });

  // Access the publication global loading state using 'isPending' property from useMutation
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

    // Initialize a new image name
    let newImage = null;

    // Upload new image if present
    if (image) {
      try {
        newImage = await uploadFile(image);
      } catch (error) {
        console.error(error.response?.data?.message || error.message);
        setError({
          isError: true,
          message: error.response?.data?.message || error.message,
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

  return (
    <form className="publish" onSubmit={handleSubmit}>
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
                type="button"
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
          <button type="submit" disabled={isPublishing}>
            {/* <button type="submit" onClick={handleSubmit} disabled={isPublishing}> */}
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
    </form>
  );
}
