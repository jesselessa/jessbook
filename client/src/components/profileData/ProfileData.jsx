import { useContext, useState, useEffect } from "react";
import "./profileData.scss";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { fetchUserData } from "../../utils/queries.js";
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
import { AuthContext } from "../../contexts/AuthContext.jsx";

export default function ProfileData() {
  const { currentUser } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Get ID of displayed profile from URL params
  const { userId } = useParams();

  // Determine if the viewed profile belongs to the logged-in user
  const isOwnProfile = String(currentUser?.id) === userId;

  // Access TQ client
  const queryClient = useQueryClient();

  // Fetch data for the profile being displayed
  const {
    isLoading: isProfileLoading,
    error: profileError,
    data: profileData,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserData(userId),
    enabled: !!userId, // Only fetch if userId is defined
    retry: false, // Do not retry if the ID is likely invalid
  });

  // Handle automatic redirection if profile does not exist or URL is malformed
  useEffect(() => {
    if (profileError) {
      // Redirect to homepage if logged in, otherwise to login page
      const destination = currentUser ? "/home" : "/";

      // Delay to allow user to see the error message or toast
      const timeout = setTimeout(() => {
        navigate(destination, { replace: true });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [profileError, currentUser, navigate]);

  // Get the list of user's followers
  const getFollowers = async (userId) => {
    try {
      const res = await makeRequest.get(
        `/relationships/followers?followedId=${userId}`
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching followers:", error);
      throw error;
    }
  };

  // Handle followers data fetching
  const {
    isLoading: isFollowersLoading,
    error: followersError,
    data: followersData,
  } = useQuery({
    queryKey: ["followers", userId],
    queryFn: () => getFollowers(userId),
    enabled: !!userId && !profileError, // Only fetch if userId is defined and profile exists
  });

  // Get the list of people followed by user
  const getFollowing = async (userId) => {
    try {
      const res = await makeRequest.get(
        `/relationships/following?followerId=${userId}`
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching following:", error);
      throw error;
    }
  };

  // Handle following data fetching
  const {
    isLoading: isFollowingLoading,
    error: followingError,
    data: followingData,
  } = useQuery({
    queryKey: ["following", userId],
    queryFn: () => getFollowing(userId),
    enabled: !!userId && !profileError,
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
      // 2A. Log error
      console.error("Error updating followers:", error);

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
      {profileError ? (
        "An error occurred. Redirecting..."
      ) : isProfileLoading ? (
        <Loader />
      ) : (
        <>
          <div className="profile-container">
            <div className="images">
              {/* Cover picture */}
              <LazyLoadImage
                src={
                  // Image uploaded on server or default image
                  profileData?.coverPic
                    ? `/uploads/${profileData?.coverPic} `
                    : defaultCover
                }
                className="cover"
                alt="cover"
              />

              {/* Profile picture */}
              <div className="img-container">
                <LazyLoadImage
                  src={
                    profileData?.profilePic
                      ? `/uploads/${profileData?.profilePic}`
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
                      {followersError ? (
                        <span className="error-count">Error</span>
                      ) : isFollowersLoading ? (
                        "..."
                      ) : (
                        `${followersCount} ${followersData?.length > 1 ? "Followers" : "Follower"
                        }`
                      )}
                    </span>

                    {/* <PeopleAltOutlinedIcon fontSize="large" /> */}
                    {/* <span className="count">
                      {followingError ? (
                        <span className="error-count">Error</span>
                      ) : isFollowingLoading ? (
                        "..."
                      ) : (
                        `${followingCount} Following`
                      )}
                    </span> */}
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
                  {profileData?.firstName} {profileData?.lastName}
                </h2>

                <div className="location">
                  <PlaceIcon />
                  <span>{profileData?.city}</span>
                </div>

                {/* Update button */}
                {isOwnProfile ? (
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

          {isOwnProfile && <Publish />}

          {/* Cf. posts controllers backend (userId !== undefined) → Only shows posts of user whose profile page is displayed  */}
          <Posts userId={userId} />
        </>
      )}

      {isOpen && <UpdateProfile user={profileData} setIsOpen={setIsOpen} />}
    </div>
  );
}
