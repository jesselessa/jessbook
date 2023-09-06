import { useContext, useState } from "react";
import "./publish.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";

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

  // Handle image upload
  const upload = async () => {
    try {
      const formData = new FormData(); // Because we can't send file directly to API
      formData.append("file", file);

      const res = await makeRequest.post("/uploads", formData);
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();

    if (desc.trim() === "") {
      // .trim() = to delete spaces at the beginning and at the end of a string
      setError({
        isError: true,
        message: "You can't edit a post without a description.",
      });
    } else {
      setError({ isError: false, message: "" });

      let imgUrl = "";
      if (file) imgUrl = await upload();

      mutation.mutate({ desc: desc.trim(), img: imgUrl }); // If success URL sent to database (posts table)
      setDesc("");
      setFile(null);
    }
  };

  return (
    <div className="publish">
      <div className="top">
        <div className="left">
          <div className="img-container">
            <img
              src={
                currentUser.profilePic
                  ? `/uploads/${currentUser.profilePic}`
                  : "https://images.pexels.com/photos/1454288/pexels-photo-1454288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              }
              alt="user"
            />
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
          {error.isError && <span className="errorMsg">{error.message}</span>}
        </div>
        <div className="right">
          {file && (
            <div className="img-container">
              <img
                className="file"
                alt="post pic"
                src={URL.createObjectURL(file)}
                // This creates a fake URL so we can show our image
              />
            </div>
          )}
        </div>
      </div>

      <hr />

      <div className="bottom">
        <div className="left">
          {/* Input image - value linked with state "file" doesn't work with file input except if value equals "" or "null" */}
          <input
            type="file"
            id="file"
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
