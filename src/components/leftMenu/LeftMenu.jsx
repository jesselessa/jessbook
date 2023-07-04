import { useContext } from "react";
import "./leftMenu.scss";

// Images
// import user from "../../assets/images/users/john_doe.jpg";
import friends from "../../assets/images/leftMenu/1.png";
import groups from "../../assets/images/leftMenu/2.png";
import marketPlace from "../../assets/images/leftMenu/3.png";
import watch from "../../assets/images/leftMenu/4.png";
import memories from "../../assets/images/leftMenu/5.png";
import events from "../../assets/images/leftMenu/6.png";
import gaming from "../../assets/images/leftMenu/7.png";
import gallery from "../../assets/images/leftMenu/8.png";
import videos from "../../assets/images/leftMenu/9.png";
import messages from "../../assets/images/leftMenu/10.png";
import fundraiser from "../../assets/images/leftMenu/11.png";
import tutorials from "../../assets/images/leftMenu/12.png";
import courses from "../../assets/images/leftMenu/13.png";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function LeftMenu() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="leftMenu" role="navigation">
      {/* Main info */}
      <div className="mainInfo">
        <div className="user">
          <img src={currentUser.profilePic} alt="profile" />
          {/* <img src={user} alt="profile" /> */}
          <span>
            {currentUser.firstName} {currentUser.lastName}
          </span>
        </div>
        <div className="item">
          <img src={friends} alt="friends" />
          <span>Friends</span>
        </div>

        <div className="item">
          <img src={groups} alt="groups" />
          <span>Groups</span>
        </div>

        <div className="item">
          <img src={marketPlace} alt="marketplace" />
          <span>Market Place</span>
        </div>

        <div className="item">
          <img src={watch} alt="watch" />
          <span>Watch</span>
        </div>

        <div className="item">
          <img src={memories} alt="memories" />
          <span>Memories</span>
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
          <img src={gaming} alt="gaming" />
          <span>Gaming</span>
        </div>

        <div className="item">
          <img src={gallery} alt="gallery" />
          <span>Gallery</span>
        </div>

        <div className="item">
          <img src={videos} alt="videos" />
          <span>Videos</span>
        </div>

        <div className="item">
          <img src={messages} alt="messages" />
          <span>Messages</span>
        </div>
      </div>

      <hr />

      {/* Other categories */}
      <div className="others">
        <h3>Others</h3>

        <div className="item">
          <img src={fundraiser} alt="fundraiser" />
          <span>Fundraiser</span>
        </div>

        <div className="item">
          <img src={tutorials} alt="tutorials" />
          <span>Tutorials</span>
        </div>

        <div className="item">
          <img src={courses} alt="courses" />
          <span>Courses</span>
        </div>
      </div>
    </div>
  );
}
