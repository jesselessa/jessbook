import { useContext } from "react";
import "./publish.scss";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";
import { DarkModeContext } from "../../contexts/darkModeContext.jsx";

// Component
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

// Images
import Image from "../../assets/images/publish/image.png";
import Map from "../../assets/images/publish/map.png";
import Friend from "../../assets/images/publish/map.png";

export default function Publish() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO : To complete
  };

  return (
    <div className="publish">
      <div className="top">
        <div className="img-container">
          <img src={currentUser.profilePic} alt="" />
        </div>

        <div className="inputGroup">
          <input
            type="text"
            placeholder={`What's up, ${currentUser.firstName} ?`}
          />
          {darkMode ? (
            <SendOutlinedIcon
              className="send"
              sx={{ fontSize: "24px", color: "lightgray" }}
            />
          ) : (
            <SendOutlinedIcon
              className="send"
              sx={{ fontSize: "24px", color: "#555" }}
            />
          )}
        </div>
      </div>

      <hr />

      <div className="bottom">
        <div className="left">
          <input type="file" id="file" />
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
          <button type="submit" onClick={() => handleSubmit}>
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
