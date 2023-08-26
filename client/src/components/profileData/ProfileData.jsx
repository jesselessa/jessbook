import { useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./profileData.scss";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios";

// Components
import Publish from "../../components/publish/Publish.jsx";
import Posts from "../../components/posts/Posts.jsx";
import Update from "../../components/update/Update.jsx";

// Icons
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlaceIcon from "@mui/icons-material/Place";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function ProfileData() {
  const [openUpdate, setOpenUpdate] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const { userId } = useParams();

  // Fetch user's info
  const fetchUserData = async () => {
    return await makeRequest
      .get(`/users/${userId}`)
      .then((res) => res.data)
      .catch((error) => console.log(error));
  };
  const { isLoading, data, error } = useQuery(["user"], fetchUserData);

  console.log("User info:", data);

  // Fetch user's relationships
  const fetchRelationships = async () => {
    return await makeRequest
      .get(`/relationships?followedUserId=${userId}`)
      .then((res) => res.data)
      .catch((error) => console.log(error));
  };

  const { isLoading: rIsLoading, data: relationshipsData } = useQuery(
    ["relationships"],
    fetchRelationships
  );

  console.log("Relationships:", relationshipsData);

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (following) => {
      if (following)
        return makeRequest.delete(`/relationships?userId=${userId}`);
      return makeRequest.post("/relationships", { userId });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["relationships"]);
      },
    }
  );

  const handleFollow = () => {
    mutation.mutate(relationshipsData.includes(currentUser.id));
  };

  return (
    <div className="profileData">
      {error ? (
        "Something went wrong."
      ) : isLoading ? (
        "Loading..."
      ) : (
        <>
          <div className="profileContainer">
            <div className="images">
              <img
                src={
                  data.coverPic ||
                  "https://images.pexels.com/photos/2314363/pexels-photo-2314363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                }
                // src={
                //   `uploads/${data.coverPic}` ||
                //   "https://images.pexels.com/photos/2314363/pexels-photo-2314363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                // }
                alt="cover"
                className="cover"
              />

              <div className="img-container">
                <img
                  src={
                    data.profilePic ||
                    "https://images.pexels.com/photos/1586981/pexels-photo-1586981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  }
                  // src={
                  //   `/uploads/${data.profilePic}` ||
                  //   "https://images.pexels.com/photos/1586981/pexels-photo-1586981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  // }
                  alt="profile"
                  className="profilePic"
                />
              </div>
            </div>

            <div className="userInfo">
              <div className="friends-contact">
                <Link to="#">
                  <div className="friends">
                    <PeopleAltOutlinedIcon fontSize="large" />
                    {/* Change later with data fetched from API */}
                    <span>441 Friends</span>
                  </div>
                </Link>

                <div className="contact">
                  <Link to="#">
                    <EmailOutlinedIcon fontSize="large" />
                  </Link>

                  <Link to="#">
                    <MoreVertIcon fontSize="large" />
                  </Link>
                </div>
              </div>
              <div className="name">
                <h2>
                  {data.firstName} {data.lastName}
                </h2>

                <div className="location">
                  <PlaceIcon />
                  <span>{data.country || "Non renseigné"}</span>
                </div>

                {error ? (
                  "Something went wrong."
                ) : rIsLoading ? (
                  "Loading..."
                ) : userId === currentUser.id ? (
                  <button onClick={() => setOpenUpdate(true)}>Update</button>
                ) : (
                  <button onClick={handleFollow}>
                    {relationshipsData.includes(currentUser.id)
                      ? "Following"
                      : "Follow"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <Publish />

          <Posts userId={userId} />
        </>
      )}

      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
    </div>
  );
}
