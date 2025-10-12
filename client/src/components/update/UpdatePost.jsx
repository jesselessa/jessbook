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

  // Release URL resource to prevent memory leaks from the standard React state preview (hook used in the image display area)
  const newImgUrl = useCleanUpFileURL(newImg);

  // Mutation to handle optimistic update for post
  const updateMutation = useMutation({
    // 1. mutationFn: Handles file upload (slow part) and API call
    // The payload must include the text field and the raw file for upload
    mutationFn: async ({ newText, newImgFile }) => {
      let uploadedImgPath = post.img; // Default path to existing image

      // If a new file is provided, upload it first
      if (newImgFile) {
        uploadedImgPath = await uploadFile(newImgFile); // <-- Slow operation
      }

      // Final object for the PUT request
      const finalUpdate = {
        text: newText,
        img: uploadedImgPath,
      };

      // Make the actual API call
      await makeRequest.put(`/posts/${post.id}`, finalUpdate);
      return { postId: post.id, ...finalUpdate };
      // Note: 'postId' is semantic alias that we chose to make the return value more meaningful and easier to use within other TanStack Query hooks, even if our server simply calls that data 'id'
    },

    // 2. onMutate (before the request happens) → Apply text and local image preview instantly (fast part)
    // The argument structure must match what is passed to 'mutate()'
    onMutate: async ({ newText, newImgFile }) => {
      // Cancel any outgoing refetches on posts to prevent conflicts
      await queryClient.cancelQueries(["posts"]);

      // Store the current query cached data for rollback
      const previousPosts = queryClient.getQueryData(["posts", userId]);

      // Initialize a temporary image URL
      let tempImgUrl = null;

      // Create a temporary Blob URL if a new file is selected
      if (newImgFile) tempImgUrl = URL.createObjectURL(newImgFile);

      // Optimistically update cache
      //! ⚠️ Merge only updated fields to prevent overwriting other data !!!
      queryClient.setQueryData(["posts", userId], (oldPosts = []) => {
        return oldPosts.map((p) =>
          p.id === post.id
            ? { ...p, text: newText, img: newImgFile ? tempImgUrl : p.img }
            : p
        );
      });

      // Context for rollback and Blob URL cleanup
      return { previousPosts, tempImgUrl };
    },

    // 3. onError (mutation failed) → Rollback to previous state
    onError: (error, _variables, context) => {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data || error.message);

      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", userId], context.previousPosts);
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

      // Invalidate and refetch posts data
      queryClient.invalidateQueries(["posts"]);

      // Reset states
      setIsOpen(false); // Close form
      setNewImg(null); // Clean up local File object
    },
  });

  // Use 'updateMutation.isPending' for the global loading state
  //? Reminder: 'isPending 'is a property automatically managed by the Tanstack Query useMutation hook
  const isUpdating = updateMutation.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isUpdating) return;

    // Check if post has been modified
    const trimmedText = newText?.trim();
    const hasTextChanged = trimmedText !== post.text.trim();
    const hasImageChanged = newImg !== null;

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

    // Trigger mutation: pass text and the raw File object
    updateMutation.mutate({
      text: trimmedText,
      newImgFile: newImg,
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
                    //! 'id' must be different from input in Publish to prevent conflicts when displaying image
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
