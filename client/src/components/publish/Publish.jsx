import { useContext, useState } from "react";
import "./publish.scss";

// Contexts
import { AuthContext } from "../../contexts/authContext.jsx";
import { DarkModeContext } from "../../contexts/darkModeContext.jsx";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";

// Component
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

// Images
import Image from "../../assets/images/publish/image.png";
import Map from "../../assets/images/publish/map.png";
import Friend from "../../assets/images/publish/map.png";

export default function Publish() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  // console.log(file);
  console.log(desc);

  const queryClient = useQueryClient(); // To automatically update posts

  const mutation = useMutation(
    (newPost) => {
      // newPost = file + desc
      makeRequest.post("/posts", newPost);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  const handleClick = (e) => {
    e.preventDefault();

    mutation.mutate({ desc });
  };

  return (
    <div className="publish">
      <div className="top">
        <div className="img-container">
          <img src={currentUser.profilePic} alt="user" />
        </div>

        <div className="inputGroup">
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

      <hr />

      <div className="bottom">
        <div className="left">
          <input
            type="file"
            id="file"
            value={file}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label htmlFor="file">
            <div className="item">
              <img src={Image} alt="" />
              <span>Add Image</span>
            </div>
          </label>
          <div className="item">
            <img src={Map} alt="" />
            <span>Add Place</span>
          </div>
          <div className="item">
            <img src={Friend} alt="" />
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
