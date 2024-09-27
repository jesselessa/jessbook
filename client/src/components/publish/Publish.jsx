import { useContext, useState } from "react";
import "./publish.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { toast } from "react-toastify";

// Images
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Contexts
import { AuthContext } from "../../contexts/authContext.jsx";
import { DarkModeContext } from "../../contexts/darkModeContext.jsx";

// Components
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { LazyLoadImage } from "../lazyLoadImage/LazyLoadImage.jsx";

// Images
import picture from "../../assets/images/publish/image.png";
import map from "../../assets/images/publish/map.png";
import friends from "../../assets/images/publish/friends.png";

export default function Publish() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const [image, setImage] = useState(null);
  const [desc, setDesc] = useState("");
  const [error, setError] = useState({ isError: false, message: "" });

  // Create a new post
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPost) => makeRequest.post("/posts", newPost),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["posts"]);
      toast.success("Post created.");
    },

    onError: (error) => {
      toast.error("Error creating post.");
      throw new Error(error);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();

    if (!desc) {
      setError({
        isError: true,
        message: "You can't edit a post without a description.",
      });

      // Reset error message after 3 seconds
      setTimeout(() => {
        setError({
          isError: false,
          message: "",
        });
      }, 3000);
      return;
    }

    // Upload new image if present
    const newImage = image ? await uploadFile(image) : null;

    // Trigger mutation to update database
    mutation.mutate({ desc: desc.trim(), img: newImage });

    // Reset states
    setImage(null); // Make sure that URL generated by URL.createObjectURL is no longer used to prevent memory leaks
    setDesc("");
  };

  return (
    <div className="publish">
      <div className="top">
        <div className="left">
          <div className="img-container">
            <LazyLoadImage
              src={
                currentUser.profilePic
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
              placeholder={`What's up, ${currentUser.firstName}\u00A0?`}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              autoComplete="off"
            />
            {darkMode ? (
              <SendOutlinedIcon
                className="send dark"
                sx={{ fontSize: "24px", color: "lightgray" }}
                onClick={handleClick}
              />
            ) : (
              <SendOutlinedIcon
                className="send"
                sx={{ fontSize: "24px", color: "#555" }}
                onClick={handleClick}
              />
            )}
          </div>
        </div>

        <div className="right">
          {image && (
            <div className="img-container">
              <LazyLoadImage
                src={URL.createObjectURL(image)}
                // Generate a dynamic URL for preview
                alt="post preview"
              />

              <button className="close" onClick={() => setImage(null)}>
                x
              </button>
            </div>
          )}
        </div>
      </div>

      {error.isError && <span className="error-msg">{error.message}</span>}

      <hr />

      <div className="bottom">
        <div className="left">
          {/* Input:file - value linked with state doesn't work except if value equals "" or "null" */}
          <label className="file-label-mob" htmlFor="file">
            <LazyLoadImage src={picture} alt="image icon" />
          </label>

          <input
            type="file"
            id="file"
            name="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
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
          <button type="submit" onClick={handleClick}>
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
