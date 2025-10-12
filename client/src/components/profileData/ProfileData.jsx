import { useContext, useState } from "react";
import "./profileData.scss";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
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
  const [isOpen, setIsOpen] = useState(false);

  const { userId } = useParams(); // ID of the profile displayed
  const queryClient = useQueryClient();

  // Get user's info
  const fetchUserData = async (userId) => {
    try {
      const res = await makeRequest.get(`/users/${userId}`);
      return res.data;
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const {
    isLoading,
    error,
    data: userData,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserData(userId),
  });

  // Get user's followers
  const getFollowers = async (userId) => {
    try {
      const res = await makeRequest.get(
        `/relationships/followers?followedId=${userId}`
      );
      return res.data;
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const {
    isLoading: isFollowersLoading,
    error: isFollowersError,
    data: followersData,
  } = useQuery({
    queryKey: ["followers", userId],
    queryFn: () => getFollowers(userId),
  });

  // Get the list of people followed by user
  const getFollowing = async (userId) => {
    try {
      const res = await makeRequest.get(
        `/relationships/following?followerId=${userId}`
      );
      return res.data;
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data || error.message);
    }
  };

  const {
    isLoading: isFollowingLoading,
    error: isFollowingError,
    data: followingData,
  } = useQuery({
    queryKey: ["following", userId],
    queryFn: () => getFollowing(userId),
  });

  // Get number of followers/following
  const followersCount = followersData?.length || 0;
  const followingCount = followingData?.length || 0;

  // Optimistic mutation to follow/unfollow a user (displayed profile = userId)
  const mutation = useMutation({
    mutationFn: (isCurrentlyFollowing) => {
      if (isCurrentlyFollowing) {
        return makeRequest.delete(`/relationships?userId=${userId}`);
      }
      return makeRequest.post("/relationships", { userId });
    },

    // 1. OnMutate (before the server response): Immediately update the cache
    onMutate: async (isCurrentlyFollowing) => {
      // 1A. Cancel any outgoing queries to avoid overwriting our optimistic update
      await queryClient.cancelQueries(["followers", userId]);

      // 1B. Store the current cached data to revert if mutation fails
      const previousFollowers = queryClient.getQueryData(["followers", userId]);

      // 1C. Optimistically update to the new value
      queryClient.setQueryData(["followers", userId], (oldData) => {
        if (!oldData) return []; // Fallback (our backend expects an array of IDs)
        return isCurrentlyFollowing
          ? oldData.filter((id) => id !== currentUser.id) // Remove current user from followers
          : [...oldData, currentUser.id]; // Add current user
      });

      // Return context with previous data for rollback in case of error
      return { previousFollowers };
    },

    // 2. OnError (mutation failure): Rollback the optimistic update
    onError: (error, _isCurrentlyFollowing, context) => {
      // 2A. Log errors
      console.error("Error updating followers:", error);
      toast.error("An error occurred while updating followers.");

      // 2B. Rollback on error
      if (context?.previousFollowers) {
        queryClient.setQueryData(
          ["followers", userId],
          context.previousFollowers
        );
      }
    },

    // 3. onSettled (either the mutation succeeds or fails): Refresh data
    onSettled: () => queryClient.invalidateQueries(["followers", userId]),
  });

  const isCurrentlyFollowing = followersData?.includes(currentUser?.id);
  const handleFollow = () => {
    mutation.mutate(isCurrentlyFollowing);
  };

  return (
    <div className="profileData">
      {error ? (
        "Something wrong."
      ) : isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="profile-container">
            <div className="images">
              {/* Cover picture */}
              <LazyLoadImage
                src={
                  // Image uploaded on server or default image
                  userData?.coverPic
                    ? `/uploads/${userData?.coverPic} `
                    : defaultCover
                }
                className="cover"
                alt="cover"
              />

              {/* Profile picture */}
              <div className="img-container">
                <LazyLoadImage
                  src={
                    userData?.profilePic
                      ? `/uploads/${userData?.profilePic}`
                      : defaultProfile
                  }
                  className="profile-pic"
                  alt="profile"
                />
              </div>
            </div>

            {/* Followers/Following + Contact */}
            <div className="user-info">
              <div className="relationships-contact">
                <div className="relationships">
                  <PeopleAltOutlinedIcon fontSize="large" />
                  <div className="followers">
                    <span className="count">
                      {isFollowersError ? (
                        <span className="error-count">Error</span>
                      ) : isFollowersLoading ? (
                        "..."
                      ) : (
                        `${followersCount.toString()} ${
                          followersData?.length > 1 ? "Followers" : "Follower"
                        }`
                      )}
                    </span>
                  </div>
                </div>

                <div className="contact">
                  <EmailOutlinedIcon fontSize="large" />
                  <MoreVertIcon fontSize="large" />
                </div>
              </div>

              {/* User's main info */}
              <div className="main-info">
                <h2>
                  {userData?.firstName} {userData?.lastName}
                </h2>

                <div className="location">
                  <PlaceIcon />
                  <span>{userData?.city}</span>
                </div>

                {/* Update button */}
                {/* Note: 'userId'(param from the URL) is a string, whereas currentUser.id is a number → 2 ≠ types, therefore we have to convert the latter in string */}
                {userId === String(currentUser?.id) ? (
                  <button onClick={() => setIsOpen(true)}>Update</button>
                ) : (
                  <button onClick={handleFollow}>
                    {mutation.isLoading ? (
                      <Loader
                        width="24px"
                        height="24px"
                        border="3px solid rgba(0, 0, 0, 0.1)"
                      />
                    ) : isCurrentlyFollowing ? (
                      "Unfollow"
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {userId === String(currentUser?.id) && <Publish />}

          {/* Cf. posts controllers backend: Posts has a prop userId which is defined (!== undefined) → Shows posts of user whose profile page is displayed  */}
          <Posts userId={userId} />
        </>
      )}

      {isOpen && <UpdateProfile user={userData} setIsOpen={setIsOpen} />}
    </div>
  );
}
