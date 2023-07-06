import { useContext } from "react";
import "./profile.scss";

// Components
import Publish from "../../components/publish/Publish.jsx";
import Posts from "../../components/posts/Posts.jsx";

// Icons
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlaceIcon from "@mui/icons-material/Place";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Profile() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="profile">
      <div className="profileContainer">
        <div className="images">
          <img
            src="https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="cover"
            className="cover"
          />
          <img
            src={currentUser.profilePic}
            alt="profile"
            className="profilePic"
          />
        </div>

        <div className="userInfo">
          <div className="friends-contact">
            <div className="friends">
              <PeopleAltOutlinedIcon fontSize="large" />
              <span>441 Friends</span>
            </div>
            <div className="contact">
              <EmailOutlinedIcon fontSize="large" />
              <MoreVertIcon fontSize="large" />
            </div>
          </div>
          <div className="name">
            <h2>
              {currentUser.firstName} {currentUser.lastName}
            </h2>

            <div className="location">
              <PlaceIcon />
              <span>France</span>
            </div>

            <button>Follow</button>
          </div>
        </div>
      </div>

      <Publish />

      <Posts />
    </div>
  );
}
