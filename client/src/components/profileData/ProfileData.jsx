import { useContext } from "react";
import "./profileData.scss";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { useToggle } from "../../hooks/useToggle.js";

// Components
import Publish from "../../components/publish/Publish.jsx";
import Posts from "../../components/posts/Posts.jsx";
import UpdateProfile from "../../components/update/UpdateProfile.jsx";

// Icons
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlaceIcon from "@mui/icons-material/Place";

// Images
import defaultCover from "../../assets/images/users/defaultCover.jpeg";
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function ProfileData() {
  const { currentUser } = useContext(AuthContext);
  const [openUpdate, toggleUpdate] = useToggle();
  const { userId } = useParams();

  // Get user's info
  const fetchUserData = async () => {
    return await makeRequest
      .get(`/users/${userId}`)
      .then((res) => res.data)
      .catch((error) => console.log(error));
  };

  const {
    isLoading,
    error,
    data: user,
  } = useQuery({ queryKey: ["user", userId], queryFn: fetchUserData });

  // Get user's relationships
  const fetchRelationships = async () => {
    return await makeRequest
      .get(`/relationships?followedUserId=${userId}`)
      .then((res) => res.data)
      .catch((error) => console.log(error));
  };

  const { data: relationships } = useQuery({
    queryKey: ["relationships"],
    queryFn: fetchRelationships,
  });

  const queryClient = useQueryClient();

  const handleRelationshipsMutation = useMutation({
    mutationFn: (following) => {
      if (following)
        return makeRequest.delete(`/relationships?userId=${userId}`);

      return makeRequest.post("/relationships", { userId });
    },

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["relationships"]);
    },
  });

  const handleUserRelationships = () => {
    handleRelationshipsMutation.mutate(relationships?.includes(currentUser.id));
  };

  return (
    <div className="profileData">
      {error ? (
        <span className="loading-msg">Something went wrong.</span>
      ) : isLoading ? (
        <span className="loading-msg">Loading...</span>
      ) : (
        <>
          {/* User's data */}
          <div className="profile-container">
            <div className="images">
              {/* Cover pic */}
              <img
                src={
                  currentUser
                    ? `/uploads/${currentUser.coverPic}`
                    : defaultCover
                }
                className="cover"
                alt="cover"
              />

              {/* Profile pic */}
              <div className="img-container">
                <img
                  src={
                    currentUser
                      ? `/uploads/${currentUser.profilePic}`
                      : defaultProfile
                  }
                  className="profile"
                  alt="profile"
                />
              </div>
            </div>

            <div className="user-info">
              <div className="friends-contact">
                <div className="friends">
                  <PeopleAltOutlinedIcon fontSize="large" />
                  {/* TODO - Implement later with real data fetched from API */}
                  <span>441 Friends</span>
                </div>

                <div className="contact">
                  <EmailOutlinedIcon fontSize="large" />

                  <MoreVertIcon fontSize="large" />
                </div>
              </div>

              <div className="main-info">
                <h2>
                  {currentUser.firstName} {currentUser.lastName}
                </h2>

                <div className="location">
                  <PlaceIcon />
                  <span>{currentUser.city || "Non renseigné"}</span>
                </div>

                {/* Relationships data */}
                {/* We use '==' (and not '===') because userId is a string and currentUser.id is an integer  */}
                {userId == currentUser.id ? (
                  <button onClick={toggleUpdate}>Update</button>
                ) : (
                  <button onClick={handleUserRelationships}>
                    {relationships?.includes(currentUser.id)
                      ? "Following"
                      : "Follow"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Edit post */}
          {userId == currentUser.id && <Publish />}

          {/* User's posts */}
          <Posts userId={userId} />
        </>
      )}

      {/* Update profile */}
      {openUpdate && <UpdateProfile user={user} toggleUpdate={toggleUpdate} />}
    </div>
  );
}
