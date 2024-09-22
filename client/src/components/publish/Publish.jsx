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

// Component
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

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

  // Add a new post
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);
        toast.success("Post created.");
      },
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (desc.trim() === "") {
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

    // Reset inputs after submission
    setImage(null);
    setDesc("");

    // Initialize variable, then, upload image and download URL
    const newImage = image ? await uploadFile(image) : null;

    // Send mutation to database (posts table) to update data
    mutation.mutate({ desc: desc.trim(), img: newImage });
  };

  return (
    <form className="publish" name="post-form" onSubmit={handleSubmit}>
      <div className="top">
        <div className="left">
          <div className="img-container">
            <img
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
            />
            {darkMode ? (
              <SendOutlinedIcon
                className="send"
                sx={{ fontSize: "24px", color: "lightgray" }}
                onClick={handleSubmit}
              />
            ) : (
              <SendOutlinedIcon
                className="send"
                sx={{ fontSize: "24px", color: "#555" }}
                onClick={handleSubmit}
              />
            )}
          </div>
        </div>

        <div className="right">
          {image && (
            <div className="img-container">
              <img
                alt="post preview"
                src={URL.createObjectURL(image)}
                // Generate a dynamic URL for post image preview
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
          <input
            type="file"
            id="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <label htmlFor="file">
            <div className="item">
              <img src={picture} alt="image icon" />
              <span>Add Image</span>
            </div>
          </label>

          <div className="item">
            <img src={map} alt="map icon" />
            <span>Add Place</span>
          </div>

          <div className="item">
            <img src={friends} alt="friends icon" />
            <span>Tag Friends</span>
          </div>
        </div>

        <div className="right">
          <button type="submit">Publish</button>
        </div>
      </div>
    </form>
  );
}
