import { useState } from "react";
import "./updatePost.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";
import { toast } from "react-toastify";

// Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function UpdatePost({ post, setOpenUpdate }) {
  const [desc, setDesc] = useState("");
  // const [desc, setDesc] = useState(post.desc);
  const [image, setImage] = useState("");

  const queryClient = useQueryClient();

  // Upload image
  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await makeRequest.post("/uploads", formData);
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  const mutation = useMutation(
    (updatedPost) => {
      return makeRequest.put(`/posts/${post.id}`, updatedPost);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);

        setOpenUpdate(false); // To close form
        toast.success("Post updated.");
      },
    }
  );

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
      const imageUrl = await uploadImage(image);
      updatedPost.img = imageUrl;
    }

    mutation.mutate(updatedPost);
  };

  return (
    <div className="updatePost">
      <div className="wrapper">
        <h1>Update Your Post</h1>

        <form>
          <div className="files">
            <label htmlFor="image">
              <span>Choose an image</span>
              <div className="imgContainer">
                {image && (
                  <img src={URL.createObjectURL(image)} alt="post-image" />
                )}
                <CloudUploadIcon className="icon" />
              </div>
            </label>
            <input
              type="file"
              id="image"
              style={{ display: "none" }}
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>
          <label>Add a text</label>
          <textarea
            rows={5}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button onClick={handleClick}>Update</button>
        </form>

        <button className="close" onClick={() => setOpenUpdate(false)}>
          X
        </button>
      </div>
    </div>
  );
}
