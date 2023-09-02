import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import "./profileData.scss";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";

// Components
import Publish from "../../components/publish/Publish.jsx";
import Posts from "../../components/posts/Posts.jsx";
import UpdateProfile from "../../components/update/UpdateProfile.jsx";

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

  const { isLoading, data, error } = useQuery(["user", userId], fetchUserData);

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
                  data.coverPic
                    ? `/uploads/${data.coverPic}`
                    : "https://images.pexels.com/photos/2314363/pexels-photo-2314363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                }
                className="cover"
                alt="cover"
              />

              <div className="img-container">
                <img
                  src={
                    data.profilePic
                      ? `/uploads/${data.profilePic}`
                      : "https://images.pexels.com/photos/1586981/pexels-photo-1586981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  }
                  className="profilePic"
                  alt="profile"
                />
              </div>
            </div>

            <div className="userInfo">
              <div className="friends-contact">
                <div className="friends">
                  <PeopleAltOutlinedIcon fontSize="large" />
                  {/* Change later with data fetched from API */}
                  <span>441 Friends</span>
                </div>

                <div className="contact">
                  <EmailOutlinedIcon fontSize="large" />

                  <MoreVertIcon fontSize="large" />
                </div>
              </div>
              <div className="name">
                <h2>
                  {data.firstName} {data.lastName}
                </h2>

                <div className="location">
                  <PlaceIcon />
                  <span>{data.city || "Non renseigné"}</span>
                </div>

                {error ? (
                  "Something went wrong."
                ) : rIsLoading ? (
                  "Loading..."
                ) : userId == currentUser.id ? (
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

          {userId == currentUser.id && <Publish />}

          <Posts userId={userId} />
        </>
      )}

      {openUpdate && (
        <UpdateProfile setOpenUpdate={setOpenUpdate} user={data} />
      )}
    </div>
  );
}
