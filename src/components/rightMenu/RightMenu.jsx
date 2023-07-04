import "./rightMenu.scss";
import user from "../../assets/images/users/jane_doe.jpg";

export default function RightMenu() {
  // TODO : Replace with data fetched from API
  const latestActivities = [
    {
      id: 1,
      user: {
        firstName: "Jane",
        lastName: "Doe",
        profilePic:
          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
      desc: "changed their cover picture",
      time: "1 min ago",
    },
    {
      id: 2,
      user: {
        firstName: "Jane",
        lastName: "Doe",
        profilePic:
          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
      desc: "liked a post",
      time: "1 min ago",
    },
    {
      id: 3,
      user: {
        firstName: "Jane",
        lastName: "Doe",
        profilePic:
          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
      desc: "liked a comment",
      time: "1 min ago",
    },
    {
      id: 4,
      user: {
        firstName: "Jane",
        lastName: "Doe",
        profilePic:
          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
      desc: "posted",
      time: "1 min ago",
    },
  ];

  const onlineUsers = [
    {
      id: 1,
      firstName: "Jane",
      lastName: "Doe",
      img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Doe",
      img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 3,
      firstName: "Jane",
      lastName: "Doe",
      img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 4,
      firstName: "Jane",
      lastName: "Doe",
      img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 5,
      firstName: "Jane",
      lastName: "Doe",
      img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
  ];

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

        {latestActivities.map((activity) => (
          <div className="activity" key={activity.id}>
            <div className="userInfo">
              <img src={activity.user.profilePic} alt="user" />
              <p>
                <span>
                  {activity.user.firstName} {activity.user.lastName}
                </span>{" "}
                {activity.desc}
              </p>
            </div>
            <span className="time">{activity.time}</span>
          </div>
        ))}
      </div>

      {/* Online friends*/}
      <div className="online">
        <h3>Online friends</h3>

        <div className="friends">
          {onlineUsers.map((user) => (
            <div className="user" key={user.id}>
              <div className="img-container">
                <img src={user.img} alt="user" />
                <div className="status"></div>
              </div>
              <span>
                {user.firstName} {user.lastName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
