import { useContext } from "react";
import "./publish.scss";

// Images
import Image from "../../assets/images/publish/image.png";
import Map from "../../assets/images/publish/map.png";
import Friend from "../../assets/images/publish/map.png";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Publish() {
  const { currentUser } = useContext(AuthContext);

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
        <input
          type="text"
          placeholder={`What's up, ${currentUser.firstName} ?`}
        />
      </div>

      <hr />

      <div className="bottom">
        <div className="left">
          <input type="file" id="file" style={{ display: "none" }} />
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
