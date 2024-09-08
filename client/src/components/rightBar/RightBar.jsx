import "./rightBar.scss";

// Images
import gift from "../../assets/images/rightBar/gift.png";
import clark from "../../assets/images/users/clark-kent.webp";
import jane from "../../assets/images/users/jane-doe.webp";
import jack from "../../assets/images/users/jack-bauer.webp";
import cindy from "../../assets/images/users/cindy-rella.jpeg";
import simba from "../../assets/images/users/simba-lion.jpeg";

export default function RightBar() {
  return (
    <div className="rightBar">
      {/* Birthdays */}
      <div className="birthdays">
        <h3>Birthdays</h3>

        <div className="birthday">
          <img src={gift} alt="gift" />
          <p>
            It's <span>Jane Doe</span>'s birthday today.
          </p>
        </div>
      </div>

      {/* Latest Activities*/}
      <div className="activities">
        <h3>Latest activities</h3>

        <div className="activity">
          <div className="userInfo">
            <div className="img-container">
              <img src={jane} alt="jane doe" />
            </div>
            <p>
              <span>Jane Doe</span> changed their profile picture
            </p>
          </div>
          <span className="time">1min ago</span>
        </div>

        <div className="activity">
          <div className="userInfo">
            <div className="img-container">
              <img src={clark} alt="clark kent" />
            </div>
            <p>
              <span>Clark Kent</span> liked a post
            </p>
          </div>
          <span className="time">15 min ago</span>
        </div>

        <div className="activity">
          <div className="userInfo">
            <div className="img-container">
              <img src={jack} alt="jack bauer" />
            </div>
            <p>
              <span>Jack Bauer</span> liked a comment
            </p>
          </div>
          <span className="time">24 min ago</span>
        </div>

        <div className="activity">
          <div className="userInfo">
            <div className="img-container">
              <img src={cindy} alt="cindy rella" />
            </div>
            <p>
              <span>Cindy Rella</span> posted
            </p>
          </div>
          <span className="time">1 hour ago</span>
        </div>
      </div>

      {/* Online friends*/}
      <div className="online">
        <h3>Online friends</h3>

        <div className="friends">
          <div className="user">
            <div className="img-container">
              <img src={cindy} alt="jane doe" />
              <div className="status-dot"></div>
            </div>
            <span>Jane Doe</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img src={clark} alt="clark kent" />
              <div className="status-dot"></div>
            </div>
            <span>Clark Kent</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img src={jack} alt="jack bauer" />
              <div className="status-dot"></div>
            </div>
            <span>Jack Bauer</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img src={cindy} alt="cindy rella" />
              <div className="status-dot"></div>
            </div>
            <span>Cindy Rella</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img src={simba} alt="simba lion" />
              <div className="status-dot"></div>
            </div>
            <span>Simba Lion</span>
          </div>
        </div>
      </div>
    </div>
  );
}
