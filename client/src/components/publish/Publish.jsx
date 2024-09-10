import { useContext, useState } from "react";
import "./publish.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { makeRequest } from "../../utils/axios.js";
import { upload } from "../../utils/upload.js";
import { useRevokeObjectURL } from "../../hooks/useRevokeObjectURL.js";

// Images
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Contexts
import { AuthContext } from "../../contexts/authContext.jsx";
import { DarkModeContext } from "../../contexts/darkModeContext.jsx";

// Component
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

// Images
import image from "../../assets/images/publish/image.png";
import map from "../../assets/images/publish/map.png";
import friends from "../../assets/images/publish/friends.png";

export default function Publish() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState({ isError: false, message: "" });

  // Add new post
  const queryClient = useQueryClient();

  const postMutation = useMutation({
    mutationFn: (newPost) => makeRequest.post("/posts", newPost),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["posts"]);

      toast.success("Post created.");
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();

    if (desc.trim() === "") {
      // .trim() deletes spaces at the beginning and end of a string
      setError({
        isError: true,
        message: "You can't edit a post without a description.",
      });
      return;
    }

    // Reset error message
    setError({ isError: false, message: "" });

    // Reset inputs after submission
    setFile(null);
    setDesc("");

    // Initialize variable, then, upload file and download URL
    let imgUrl = "";
    if (file) imgUrl = await upload(file);

    postMutation.mutate({ desc: desc.trim(), img: imgUrl });
    // Data sent to 'posts' table
  };

  // Cleanup function to release URL resources when component is unmounted or file URL changes
  useRevokeObjectURL(file);

  return (
    <div className="publish">
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
              placeholder={`What's up, ${currentUser.firstName} ?`}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            {darkMode ? (
              <SendOutlinedIcon
                className="send"
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
          {file && (
            <div className="img-container">
              <img
                className="file"
                alt="post pic"
                src={URL.createObjectURL(file)}
                // Create a fake URL to preview post image
              />
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
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label htmlFor="file">
            <div className="item">
              <img src={image} alt="image icon" />
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
          <button type="submit" onClick={handleClick}>
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
