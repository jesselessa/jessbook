import { useState } from "react";
import "./updatePost.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { useCleanUpFileURL } from "../../hooks/useCleanUpFileURL.js";
import { toast } from "react-toastify";

// Components
import LazyLoadImage from "../../components/lazyLoadImage/LazyLoadImage.jsx";
import Overlay from "../overlay/Overlay.jsx";

// Icon
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function UpdatePost({ post, setOpenUpdate }) {
  const [newDesc, setNewDesc] = useState(post.desc);
  const [newImg, setNewImg] = useState(null);

  const queryClient = useQueryClient();

  // Mutation to handle post update
  const updateMutation = useMutation({
    mutationFn: (updatedPost) =>
      makeRequest.put(`/posts/${post.id}`, updatedPost),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["posts"]);
      toast.success("Post updated.");
    },

    onError: (error) =>
      console.error(
        "Error updating post:",
        error.response?.data || error.message
      ),
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // Check if post has been modified
    const isDescModified = newDesc?.trim() !== post.desc?.trim();
    const isImageModified = newImg !== null;

    if (!isDescModified && !isImageModified) {
      toast.info("No changes detected.");
      return;
    }

    // Check if description is empty
    if (newDesc?.trim()?.length === 0) {
      toast.error("You must add a description to your post.");
      return;
    }

    // Check post length
    if (newDesc?.trim()?.length > 1000) {
      toast.error("Your post can't contain more than 1000\u00A0characters.");
      return;
    }

    // Prepare updated data
    const updatedPost = {
      ...post,
      desc: newDesc.trim(),
    };

    // If an image is selected, upload it and update post
    if (newImg) {
      const updatedImg = await uploadFile(newImg);
      updatedPost.img = updatedImg;
    }

    // Trigger mutation to update database
    updateMutation.mutate(updatedPost);
    setOpenUpdate(false); // Close form

    // Reset image state to release URL resource
    setNewImg(null);
  };

  // Release URL resource to prevent memory leaks
  useCleanUpFileURL(newImg);

  return (
    <>
      <div className="updatePost">
        <div className="wrapper">
          <h1>Update Your Post</h1>

          <form name="update-post-form">
            <div className="files">
              <div className="image">
                <span>Choose an image</span>
                <div className="img-container">
                  {(newImg || post.img) && (
                    <LazyLoadImage
                      src={
                        newImg
                          ? URL.createObjectURL(newImg)
                          : `/uploads/${post.img}`
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
                    onChange={(e) => setNewImg(e.target.files[0])}
                  />
                </div>
              </div>
            </div>

            <label htmlFor="new-desc">Add a new text</label>
            <textarea
              id="new-desc"
              name="new-desc"
              rows={8}
              placeholder="Write a text..."
              maxLength={1000}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />

            <button className="submit" onClick={handleClick}>
              Update
            </button>
          </form>

          <button className="close" onClick={() => setOpenUpdate(false)}>
            X
          </button>
        </div>
      </div>

      <Overlay onClick={() => setOpenUpdate(false)} />
    </>
  );
}
