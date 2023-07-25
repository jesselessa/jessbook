import "./rightMenu.scss";

// Image
import gift from "../../assets/images/gift.png";

export default function RightMenu() {
  return (
    <div className="rightMenu">
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
          <span className="time">1 min ago</span>
        </div>

        <div className="activity">
          <div className="userInfo">
            <div className="img-container">
              <img
                src="https://images.pexels.com/photos/11748915/pexels-photo-11748915.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
                alt="user"
              />
            </div>
            <p>
              <span>Mickey Mouse</span> liked a comment
            </p>
          </div>
          <span className="time">1 min ago</span>
        </div>

        <div className="activity">
          <div className="userInfo">
            <div className="img-container">
              <img
                src="https://images.pexels.com/photos/1520760/pexels-photo-1520760.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="user"
              />
            </div>
            <p>
              <span>Cinderella Princess</span> posted
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
                src="https://images.pexels.com/photos/11748915/pexels-photo-11748915.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
                alt="user"
              />
              <div className="status-dot"></div>
            </div>
            <span>Mickey Mouse</span>
          </div>

          <div className="user">
            <div className="img-container">
              <img
                src="https://images.pexels.com/photos/1520760/pexels-photo-1520760.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
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
