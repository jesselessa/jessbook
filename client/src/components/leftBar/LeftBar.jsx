import { useContext } from "react";
import "./leftBar.scss";
import { useNavigate } from "react-router-dom";

// Images
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";
import friends from "../../assets/images/leftBar/friends.png";
import video from "../../assets/images/leftBar/video.png";
import groups from "../../assets/images/leftBar/group.png";
import marketPlace from "../../assets/images/leftBar/market.png";
import news from "../../assets/images/leftBar/news.png";
import events from "../../assets/images/leftBar/events.png";
import gaming from "../../assets/images/leftBar/gaming.png";
import messages from "../../assets/images/leftBar/messages.png";
import fundraiser from "../../assets/images/leftBar/fundraiser.png";
import flag from "../../assets/images/leftBar/flag.png";
import tutorials from "../../assets/images/leftBar/tutorials.png";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function LeftBar() {
  const { currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const navigateAndScrollTop = () => {
    navigate(`/profile/${currentUser?.id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="leftBar" role="navigation">
      {/* Main info */}
      <div className="mainInfo">
        <div className="user" onClick={navigateAndScrollTop}>
          <div className="img-container">
            <img
              src={
                currentUser?.profilePic
                  ? `/uploads/${currentUser?.profilePic}`
                  : defaultProfile
              }
              alt="profile"
            />
          </div>
          <span>
            {currentUser?.firstName} {currentUser?.lastName}
          </span>
        </div>

        <div className="item">
          <img src={friends} alt="friends" />
          <span>Friends</span>
        </div>

        <div className="item">
          <img src={video} alt="video" />
          <span>Video</span>
        </div>

        <div className="item">
          <img src={groups} alt="groups" />
          <span>Groups</span>
        </div>

        <div className="item">
          <img src={news} alt="memories" />
          <span>News</span>
        </div>

        <div className="item">
          <img src={messages} alt="messages" />
          <span>Messages</span>
        </div>
      </div>

      <hr />

      {/* Shortcuts */}
      <div className="shortcuts">
        <h3>Your shortcuts</h3>

        <div className="item">
          <img src={events} alt="events" />
          <span>Events</span>
        </div>

        <div className="item">
          <img src={flag} alt="gaming" />
          <span>Pages</span>
        </div>

        <div className="item">
          <img src={marketPlace} alt="marketplace" />
          <span>Market Place</span>
        </div>
      </div>

      <hr />

      {/* Other categories */}
      <div className="others">
        <h3>Others</h3>

        <div className="item">
          <img src={gaming} alt="gaming" />
          <span>Gaming</span>
        </div>

        <div className="item">
          <img src={fundraiser} alt="fundraiser" />
          <span>Fundraiser</span>
        </div>

        <div className="item">
          <img src={tutorials} alt="tutorials" />
          <span>Tutorials</span>
        </div>
      </div>
    </div>
  );
}
