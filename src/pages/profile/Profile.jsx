import { useContext } from "react";
import "./profile.scss";

// Component
import Posts from "../../components/posts/Posts";

// Icons
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PlaceIcon from "@mui/icons-material/Place";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Profile() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="profile">
      <div className="profileContainer">
        <div className="images">
          <img
            src="https://images.pexels.com/photos/13440765/pexels-photo-13440765.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="cover"
            className="cover"
          />
          <img
            src="https://images.pexels.com/photos/14028501/pexels-photo-14028501.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load"
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
      <Posts />
    </div>
  );
}
