import "./rightMenu.scss";
import user from "../../assets/images/users/jane_doe.jpg";

export default function RightMenu() {
  return (
    <div className="rightMenu">
      {/* Friends suggestions */}
      <div className="suggestions">
        <h3>Suggestions For You</h3>

        <div className="suggestion">
          <div className="user">
            <img src={user} alt="user" />
            <span>Jane Doe</span>
          </div>

          <div className="buttons">
            <button>Follow</button>
            <button>Dismiss</button>
          </div>
        </div>

        <div className="suggestion">
          <div className="user">
            <img src={user} alt="user" />
            <span>Jane Doe</span>
          </div>

          <div className="buttons">
            <button>Follow</button>
            <button>Dismiss</button>
          </div>
        </div>
      </div>

      {/* Latest Activities*/}
      <div className="activities">
        <h3>Latest activities</h3>

        <div className="activity">
          <div className="userInfo">
            <img src={user} alt="user" />
            <p>
              <span>Jane Doe</span> changed their cover picture
            </p>
          </div>
          <span className="time">1 min ago</span>
        </div>

        <div className="activity">
          <div className="userInfo">
            <img src={user} alt="user" />
            <p>
              <span>Jane Doe</span> liked a post
            </p>
          </div>
          <span className="time">1 min ago</span>
        </div>

        <div className="activity">
          <div className="userInfo">
            <img src={user} alt="user" />
            <p>
              <span>Jane Doe</span> liked a comment
            </p>
          </div>
          <span className="time">1 min ago</span>
        </div>

        <div className="activity">
          <div className="userInfo">
            <img src={user} alt="user" />
            <p>
              <span>Jane Doe</span> posted
            </p>
          </div>
          <span className="time">1 min ago</span>
        </div>
      </div>

      {/* Online friends*/}
      <div className="online">
        <h3>Online friends</h3>

        <div className="friends">
          <div className="user">
            <div className="img-container">
              <img src={user} alt="user" />
              <div className="status"></div>
            </div>
            <span>Jane Doe</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img src={user} alt="user" />
              <div className="status"></div>
            </div>
            <span>Jane Doe</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img src={user} alt="user" />
              <div className="status"></div>
            </div>
            <span>Jane Doe</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img src={user} alt="user" />
              <div className="status"></div>
            </div>
            <span>Jane Doe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
