import { useState } from "react";
import "./updatePost.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { toast } from "react-toastify";

// Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Component
import Overlay from "../overlay/Overlay.jsx";

export default function UpdatePost({ post, setOpenUpdate }) {
  const [desc, setDesc] = useState(post.desc);
  const [image, setImage] = useState(null);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updatedPost) =>
      makeRequest.put(`/posts/${post.id}`, updatedPost),

    onSuccess: () => {
      // Invalidate and refetch & close form after submission
      queryClient.invalidateQueries(["posts"]);
      toast.success("Post updated.");
      setOpenUpdate(false);
    },

    onError: (error) => {
      toast.error("Error updating post.");
      throw new Error(error);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // Check if post has been modified
    if (desc.trim() === post.desc.trim() && !image) {
      toast.info("No changes detected.");
      return;
    }

    // Check if post has a description
    if (!desc.trim()) {
      toast.error("You must add a description to your post.");
      return;
    }

    const updatedPost = {
      ...post,
      desc: desc.trim(),
    };

    if (image) {
      const newImage = await uploadFile(image);
      updatedPost.img = newImage;
    }

    updateMutation.mutate(updatedPost);

    // Reset image state to release URL resources
    setImage(null);
  };

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
                  {(image || post.img) && (
                    <img
                      src={
                        image
                          ? URL.createObjectURL(image)
                          : `/uploads/${post.img}`
                      }
                      alt="post preview"
                    />
                  )}
                  <label className="file-label" htmlFor="file">
                    <CloudUploadIcon className="icon" />
                  </label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </div>
              </div>
            </div>

            <label htmlFor="text">Add a text</label>
            <textarea
              id="text"
              name="text"
              rows={8}
              placeholder="Write a text..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
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

      <Overlay />
    </>
  );
}
