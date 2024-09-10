import { useState } from "react";
import "./updatePost.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { makeRequest } from "../../utils/axios.js";
import { upload } from "../../utils/upload.js";
import { useRevokeObjectURL } from "../../hooks/useRevokeObjectURL.js";

// Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Components
import Overlay from "../overlay/Overlay.jsx";
import LazyImage from "../LazyImage.jsx";

export default function UpdatePost({ post, toggleUpdate }) {
  const [desc, setDesc] = useState(post.desc);
  const [image, setImage] = useState("");

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updatedPost) =>
      makeRequest.put(`/posts/${post.id}`, updatedPost),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["posts"]);

      toast.success("Post updated.");
      toggleUpdate(); // Close form after submission
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
      const imageUrl = await upload(image);
      updatedPost.img = imageUrl;
    }

    updateMutation.mutate(updatedPost);
  };

  // Cleanup function inside useEffect to release URL resources when component is unmounted or image URL change
  useRevokeObjectURL(image);

  return (
    <>
      <div className="updatePost">
        <div className="wrapper">
          <h1>Update Your Post</h1>

          <form>
            <div className="files">
              <label htmlFor="image">
                <span>Choose an image</span>
                <div className="img-container">
                  {image && (
                    <LazyImage
                      src={URL.createObjectURL(image)}
                      alt="post-image"
                    />
                  )}
                  <CloudUploadIcon className="icon" />
                </div>
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
            <label>Add a text</label>
            <textarea
              rows={8}
              placeholder="Write a text..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <button onClick={handleClick}>Update</button>
          </form>

          <button className="close" onClick={toggleUpdate}>
            X
          </button>
        </div>
      </div>

      <Overlay />
    </>
  );
}
