import { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import "./profile.scss";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios";

// Components
import Publish from "../../components/publish/Publish.jsx";
import Posts from "../../components/posts/Posts.jsx";

// Icons
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlaceIcon from "@mui/icons-material/Place";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Profile() {
  const { currentUser } = useContext(AuthContext);

  const userId = useParams();

  const { isLoading, error, data } = useQuery(["user"], () => {
    makeRequest.get(`/users/${userId}`).then((res) => res.data);
  });

  const { isLoading: rIsLoading, data: relationshipsData } = useQuery(
    ["relationships"],
    () =>
      makeRequest
        .get(`/relationships?followedUserId=${userId}`)
        .then((res) => res.data)
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
    <div className="profile">
      {error ? (
        "Something went wrong"
      ) : isLoading ? (
        "Loading..."
      ) : (
        <>
          <div className="profileContainer">
            <div className="images">
              <img src={data.coverPic} alt="cover" className="cover" />
              {/* <img src={`/uploads/${data.coverPic}`} alt="cover" className="cover" /> */}

              <div className="img-container">
                <img
                  src={data.profilePic}
                  // src={`/uploads/${data.profilePic}`}
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
                  <span>{data?.country ? data.country : "Non renseigné"}</span>
                </div>

                {error ? (
                  "Something went wrong."
                ) : rIsLoading ? (
                  "Loading..."
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
    </div>
  );
}
