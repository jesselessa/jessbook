import "./rightMenu.scss";

// Image
import gift from "../../assets/images/gift.png";

export default function RightMenu() {
  //TODO - Project enhancements : fetch data from real API
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
        firstName: "Clark",
        lastName: "Kent",
        profilePic:
          "https://images.pexels.com/photos/6333652/pexels-photo-6333652.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
      desc: "liked a post",
      time: "1 min ago",
    },
    {
      id: 3,
      user: {
        firstName: "Mickey",
        lastName: "Mouse",
        profilePic:
          "https://images.pexels.com/photos/11748915/pexels-photo-11748915.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      },
      desc: "liked a comment",
      time: "1 min ago",
    },
    {
      id: 4,
      user: {
        firstName: "Cinderella",
        lastName: "Princess",
        profilePic:
          "https://images.pexels.com/photos/1520760/pexels-photo-1520760.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
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
      profilePic:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 2,
      firstName: "Clark",
      lastName: "Key",
      profilePic:
        "https://images.pexels.com/photos/6333652/pexels-photo-6333652.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 3,
      firstName: "Mickey",
      lastName: "Mouse",
      profilePic:
        "https://images.pexels.com/photos/11748915/pexels-photo-11748915.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
    },
    {
      id: 4,
      firstName: "Cinderella",
      lastName: "Princess",
      profilePic:
        "https://images.pexels.com/photos/1520760/pexels-photo-1520760.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 5,
      firstName: "Simba",
      lastName: "Lion",
      profilePic:
        "https://images.pexels.com/photos/5792673/pexels-photo-5792673.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
  ];

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

        {latestActivities.map((activity) => (
          <div className="activity" key={activity.id}>
            <div className="userInfo">
              <div className="img-container">
                <img src={activity.user.profilePic} alt="user" />
              </div>
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
                <img src={user.profilePic} alt="user" />
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
