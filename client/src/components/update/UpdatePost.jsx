import { useState } from "react";
import "./updatePost.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { useCleanUpFileURL } from "../../hooks/useCleanUpFileURL.js";
import { toast } from "react-toastify";

// Components
import LazyLoadImage from "../../components/lazyLoadImage/LazyLoadImage.jsx";
import Loader from "../../components/loader/Loader.jsx";

// Icon
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function UpdatePost({ post, userId, setIsOpen }) {
  const [newText, setNewText] = useState(post.text);
  const [newImg, setNewImg] = useState(null); // Either 'null' or File object when selected
  const [error, setError] = useState({ isError: false, message: "" });

  const queryClient = useQueryClient();

  // Generate a cleaned-up URL for the new image (if any)
  const newImgUrl = useCleanUpFileURL(newImg);

  // Mutation to handle optimistic update for post
  const updateMutation = useMutation({
    mutationFn: async ({ updatedText, imgFile }) => {
      // Upload new image if any, otherwise keep existing image path
      const uploadedImgPath = imgFile ? await uploadFile(imgFile) : post.img;

      const finalUpdate = {
        text: updatedText,
        img: uploadedImgPath,
      };

      // Make the actual API call
      const res = await makeRequest.put(`/posts/${post.id}`, finalUpdate);
      return res.data;
    },

    // 2. onMutate (before the request happens) → Apply text and local image preview instantly (fast part)
    onMutate: async ({ updatedText, imgFile }) => {
      // Cancel any outgoing refetches for posts to prevent conflicts
      await queryClient.cancelQueries(["posts"]);
      await queryClient.cancelQueries(["posts", post.userId]);

      // Store the current query cached data for rollback if mutation fails
      const previousGlobalPosts = queryClient.getQueryData(["posts"]) || [];
      const previousUserPosts =
        queryClient.getQueryData(["posts", post.userId]) || [];

      // Initialize the optimistic image path (defaulting to the existing image)
      let optimisticCacheImg = post.img;
      let tempImgUrlToRevoke = null;

      if (imgFile) {
        // 1. Create a Blob URL for instant local display (this is NOT the final path)
        optimisticCacheImg = URL.createObjectURL(imgFile);
        tempImgUrlToRevoke = optimisticCacheImg; // Store the URL for cleanup in onSettled
      }   
      // 2. If imgFile is null, optimisticCacheImg remains post.img (the existing image path)

      // Optimistically update both global and user's posts caches
      const applyOptimisticUpdate = (oldPosts = []) =>
        oldPosts.map((p) =>
          // Use optimisticCacheImg which is either the Blob URL or the existing path
          p.id === post.id
            ? { ...p, text: updatedText, img: optimisticCacheImg }
            : p
        );

      queryClient.setQueryData(["posts"], applyOptimisticUpdate);
      queryClient.setQueryData(["posts", post.userId], applyOptimisticUpdate);

      // Context for rollback and Blob URL cleanup
      return {
        previousGlobalPosts,
        previousUserPosts,
        tempImgUrl: tempImgUrlToRevoke,
      };
    },

    // 3. onError (mutation failed) → Rollback to previous state
    onError: (error, _variables, context) => {
      console.error("Error updating post:", error);
      toast.error(error.response?.data?.message || error.message);

      if (context?.previousGlobalPosts) {
        queryClient.setQueryData(["posts"], context.previousGlobalPosts);
      }
      if (context?.previousUserPosts) {
        queryClient.setQueryData(["posts", post.userId], context.previousUserPosts);
      }
    },

    // 4. onSuccess (mutation is successful) → Display a message and reset error messages
    onSuccess: () => {
      toast.success("Post updated.");
      setError({ isError: false, message: "" });
    },

    // 5. onSettled (either mutation succeeds or fails) → Invalidate query and clean up local states
    onSettled: (_data, _error, _variables, context) => {
      // Revoke the Blob URL created in onMutate to prevent memory leaks
      if (context?.tempImgUrl && context.tempImgUrl.startsWith("blob:")) {
        URL.revokeObjectURL(context.tempImgUrl);
      }

      // Invalidate and refetch posts on Profile page and Home feed
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["posts", post.userId]);

      setIsOpen(false); // Close form
      setNewImg(null); // Clean up local File object
    },
  });

  const isUpdating = updateMutation.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isUpdating) return;

    // Use the state variable (newText) to compare changes
    const trimmedText = newText?.trim();
    const originalTextTrimmed = post.text.trim();

    // Check for changes
    const hasTextChanged = trimmedText !== originalTextTrimmed;
    const hasImageChanged = newImg !== null; // newImg is a File object if changed

    if (!hasTextChanged && !hasImageChanged) {
      toast.info("No changes detected.");
      return;
    }

    // Check if description is empty
    if (!trimmedText) {
      setError({
        isError: true,
        message: "Your post must contain a description.",
      });

      return;
    }

    // Check post length
    if (trimmedText.length > 1000) {
      setError({
        isError: true,
        message: "Your post can't contain more than 1000\u00A0characters.",
      });
      return;
    }

    // Trigger mutation: pass text and the raw File object (or null)
    updateMutation.mutate({
      updatedText: trimmedText,
      imgFile: newImg,
    });
  };

  // Handle inputs changes
  const handleInputsChange = (e) => {
    // Reset previous error message
    setError({ isError: false, message: "" });

    const { id, value, files } = e.target;
    if (id === "new-text") {
      setNewText(value);
    } else {
      setNewImg(files[0]);
    }
  };

  return (
    <>
      <div className="updatePost">
        <div className="wrapper">
          <h1>Update Your Post</h1>

          <form name="update-post-form" onSubmit={handleSubmit}>
            <div className="files">
              <div className="image">
                <span>Choose an image</span>
                <div className="img-container">
                  {(newImgUrl || post.img) && (
                    <LazyLoadImage
                      src={
                        newImgUrl
                          ? // URL generated by the hook (for local state)
                            newImgUrl
                          : `/uploads/${post.img}` // Existing image
                      }
                      alt="post preview"
                    />
                  )}

                  {/* File input for image selection */}
                  <label className="file-label" htmlFor="new-file">
                    <CloudUploadIcon className="icon" />
                  </label>
                  <input
                    type="file"
                    // 'id' must be different from input in Publish to prevent conflicts when displaying image
                    id="new-file"
                    name="new-file"
                    accept="image/*"
                    onChange={handleInputsChange}
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>

            <label htmlFor="new-text">Add a new text</label>
            <textarea
              id="new-text"
              name="new-text"
              rows={8}
              placeholder="Write a text..."
              value={newText}
              onChange={handleInputsChange}
              disabled={isUpdating}
            />

            <button type="submit" className="submit" disabled={isUpdating}>
              {isUpdating ? (
                <Loader
                  width="24px"
                  height="24px"
                  border="3px solid rgba(0, 0, 0, 0.1)"
                />
              ) : (
                "Update"
              )}
            </button>
          </form>

          {/* Display error message */}
          {error.isError && <div className="error-msg">{error.message}</div>}

          <button
            className="close"
            onClick={() => setIsOpen(false)}
            disabled={isUpdating}
          >
            X
          </button>
        </div>
      </div>
    </>
  );
}
