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

  // Release URL resource to prevent memory leaks (hook used in the image display area)
  const newImgUrl = useCleanUpFileURL(newImg);

  // Mutation to handle optimistic update for post
  const updateMutation = useMutation({
    // 1. mutationFn: Handles file upload (slow part) and API call
    // The payload must include the text field and the raw file for upload
    mutationFn: async ({ updatedText, imgFile }) => {
      // If a new file is present, upload it and get the path. Otherwise, use the existing image path (post.img) to ensure it is kept (rule: cannot be removed)
      const uploadedImgPath = imgFile ? await uploadFile(imgFile) : post.img;

      const finalUpdate = {
        text: updatedText,
        img: uploadedImgPath,
      };

      // Make the actual API call
      await makeRequest.put(`/posts/${post.id}`, finalUpdate);

      // Return the final data to be used in 'onSuccess' (if needed)
      return { postId: post.id, ...finalUpdate };
    },

    // 2. onMutate (before the request happens) → Apply text and local image preview instantly (fast part)
    // The argument structure must match what is passed to 'mutate()'
    onMutate: async ({ updatedText, imgFile }) => {
      // Cancel any outgoing refetches for posts to prevent conflicts (target current user's posts)
      await queryClient.cancelQueries(["posts", post.userId]);

      // Store the current query cached data for rollback if mutation fails
      const previousPosts = queryClient.getQueryData(["posts", post.userId]);

      // Initialize the optimistic image path
      let optimisticImg = post.img;

      // If a new file is selected, use a temporary Blob URL for instant preview
      if (imgFile) optimisticImg = URL.createObjectURL(imgFile);

      // Optimistically update cache for the current user's posts
      // ⚠️ Merge only updated data to prevent overwriting existing one !!!
      queryClient.setQueryData(["posts", post.userId], (oldPosts = []) => {
        return oldPosts.map((p) =>
          p.id === post.id
            ? {
                ...p,
                text: updatedText,
                img: optimisticImg,
              }
            : p
        );
      });

      // Context for rollback and Blob URL cleanup
      return { previousPosts, tempImgUrl: imgFile ? optimisticImg : null };
    },

    // 3. onError (mutation failed) → Rollback to previous state
    onError: (error, _variables, context) => {
      console.error(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message);

      if (context?.previousPosts) {
        // Rollback to previous posts list
        queryClient.setQueryData(["posts", post.userId], context.previousPosts);
      }
    },

    // 4. onSuccess (mutation is successful) → Display a message and reset error messages
    onSuccess: () => {
      toast.success("Post updated.");
      setError({ isError: false, message: "" });
    },

    // 5. onSettled (either mutation succeeds or fails) → Invalidate query and clean up local states
    onSettled: (_data, error, _variables, context) => {
      // Revoke the Blob URL created in onMutate to prevent memory leaks
      if (context?.tempImgUrl && context.tempImgUrl.startsWith("blob:"))
        URL.revokeObjectURL(context.tempImgUrl);

      // Invalidate user's specific post list (Profile)
      queryClient.invalidateQueries(["posts", post.userId]);

      // Invalidate generic post list (Timeline/Home)
      queryClient.invalidateQueries(["posts"]);

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
