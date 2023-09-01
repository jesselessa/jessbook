import "./rightBar.scss";

// Image
import gift from "../../assets/images/rightBar/gift.png";

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
              <img
                src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="user"
              />
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
              <img
                src="https://images.pexels.com/photos/6333652/pexels-photo-6333652.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="user"
              />
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
              <img
                src="https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="user"
              />
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
              <img
                src="https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="user"
              />
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
              <img
                src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="user"
              />
              <div className="status-dot"></div>
            </div>
            <span>Jane Doe</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img
                src="https://images.pexels.com/photos/6333652/pexels-photo-6333652.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="user"
              />
              <div className="status-dot"></div>
            </div>
            <span>Clark Kent</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img
                src="https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="user"
              />
              <div className="status-dot"></div>
            </div>
            <span>Jack Bauer</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img
                src="https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="user"
              />
              <div className="status-dot"></div>
            </div>
            <span>Cinderella Princess</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img
                src="https://images.pexels.com/photos/5792673/pexels-photo-5792673.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="user"
              />
              <div className="status-dot"></div>
            </div>
            <span>Simba Lion</span>
          </div>
        </div>
      </div>
    </div>
  );
}
