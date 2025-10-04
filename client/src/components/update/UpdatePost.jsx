import { useState, useRef } from "react";
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
  const [newImg, setNewImg] = useState(null);
  const [error, setError] = useState({ isError: false, message: "" });
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();

  // Mutation to handle optimistic update for post
  const updateMutation = useMutation({
    mutationFn: (updatedPost) =>
      makeRequest.put(`/posts/${post.id}`, updatedPost),

    // OnMutate → Before the request happens
    onMutate: async (updatedPost) => {
      // Cancel any outgoing refetches on posts
      await queryClient.cancelQueries(["posts"]);

      // Store the current query cached data
      const previousPosts = queryClient.getQueryData(["posts", userId]);

      // Optimistically update cache
      //! ⚠️ Reminder: Don't merge an uncomplete optimistic object (e.g., if we only return 'text' and 'img', whereas 'posts' SQL table also contains other keys), in this case 'updatedPost', because it will overwrite our existing data => 💡 Only merge with the new one !!!
      queryClient.setQueryData(["posts", userId], (oldPosts = []) => {
        return oldPosts.map((p) =>
          p.id === post.id
            ? { ...p, text: updatedPost.text, img: updatedPost.img || p.img }
            : p
        );
      });

      // Context for rollback
      return { previousPosts };
    },

    // OnError → Rollback to previous state
    onError: (err, _updatedPost, context) => {
      if (import.meta.env.DEV) console.error("Error updating post:", err);
      toast.error("An error occurred while updating post.");

      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", userId], context.previousPosts);
      }
    },

    // OnSuccess → Successful mutation
    onSuccess: () => {
      toast.success("Post updated.");
    },

    // OnSettled → Either mutation succeeds or fails
    onSettled: () => {
      // Invalidate and refetch posts data
      queryClient.invalidateQueries(["posts"]);

      // Reset states
      setIsOpen(false); // Close form
      setNewImg(null); // Cleanup local URL
      setError({ isError: false, message: "" });

      // Reset input value in DOM
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

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

    // Prepare updated post object
    const updatedPost = {
      ...post,
      text: newText.trim(),
    };

    // Upload new image if selected
    if (hasImageChanged) {
      try {
        updatedPost.img = await uploadFile(newImg);
      } catch (err) {
        if (import.meta.env.DEV) console.error("Error uploading image:", err);
        setError({
          isError: true,
          message: "An error occurred while uploading image.",
        });
        return;
      }
    }

    // Trigger mutation
    updateMutation.mutate(updatedPost);
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

  // Release URL resource to prevent memory leaks
  const newImgUrl = useCleanUpFileURL(newImg);

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
                          ? // URL generated by the hook
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
                    ref={fileInputRef}
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
