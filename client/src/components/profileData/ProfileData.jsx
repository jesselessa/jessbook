import { useContext, useState } from "react";
import "./profileData.scss";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";

// Components
import Publish from "../../components/publish/Publish.jsx";
import Posts from "../../components/posts/Posts.jsx";
import UpdateProfile from "../../components/update/UpdateProfile.jsx";
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";
import Loader from "../loader/Loader.jsx";

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
  const [openUpdate, setOpenUpdate] = useState(false);

  const { userId } = useParams();

  const queryClient = useQueryClient();

  // Get user info
  const fetchUserData = async () => {
    try {
      const res = await makeRequest.get(`/users/${userId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const {
    isLoading,
    error,
    data: user,
  } = useQuery({ queryKey: ["user", userId], queryFn: fetchUserData });

  // Get user relationships
  const fetchRelationships = async () => {
    try {
      const res = await makeRequest.get(`/relationships?followedId=${userId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching relationships data:", error);
    }
  };

  const { data: relationshipsData } = useQuery({
    queryKey: ["relationships"],
    queryFn: fetchRelationships,
  });

  const mutation = useMutation({
    mutationFn: (following) => {
      if (following) {
        return makeRequest.delete(`/relationships?userId=${userId}`);
      }
      return makeRequest.post("/relationships", { userId });
    },

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["relationships"]);
    },
  });

  const handleFollow = () => {
    try {
      mutation.mutate(relationshipsData?.includes(currentUser?.id));
    } catch (error) {
      console.error("Error creating or deleting relationship:", error);
    }
  };

  return (
    <div className="profileData">
      {error ? (
        "Something went wrong."
      ) : isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="profile-container">
            <div className="images">
              <LazyLoadImage
                src={
                  user?.coverPic ? `/uploads/${user?.coverPic}` : defaultCover
                }
                className="cover"
                alt="cover"
              />

              <div className="img-container">
                <LazyLoadImage
                  src={
                    user?.profilePic
                      ? `/uploads/${user?.profilePic}`
                      : defaultProfile
                  }
                  className="profile-pic"
                  alt="profile"
                />
              </div>
            </div>

            <div className="user-info">
              <div className="friends-contact">
                <div className="friends">
                  <PeopleAltOutlinedIcon fontSize="large" />
                  {/* TODO - Update with data fetched from API */}
                  <span>441 Friends</span>
                </div>

                <div className="contact">
                  <EmailOutlinedIcon fontSize="large" />

                  <MoreVertIcon fontSize="large" />
                </div>
              </div>

              <div className="main-info">
                <h2>
                  {user?.firstName} {user?.lastName}
                </h2>

                <div className="location">
                  <PlaceIcon />
                  <span>{user?.city || "Non renseigné"}</span>
                </div>

                {userId === String(currentUser?.id) ? (
                  <button
                    onClick={() => setOpenUpdate((prevState) => !prevState)}
                  >
                    Update
                  </button>
                ) : (
                  <button onClick={handleFollow}>
                    {relationshipsData?.includes(currentUser?.id)
                      ? "Unfollow"
                      : "Follow"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {userId === String(currentUser?.id) && <Publish />}

          <Posts userId={userId} />
        </>
      )}

      {openUpdate && (
        <UpdateProfile user={user} setOpenUpdate={setOpenUpdate} />
      )}
    </div>
  );
}
