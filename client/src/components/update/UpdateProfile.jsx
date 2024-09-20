import { useContext, useState } from "react";
import "./updateProfile.scss";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { toast } from "react-toastify";

// Icon
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Images
import defaultCover from "../../assets/images/users/defaultCover.jpeg";
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

// Component
import Overlay from "../overlay/Overlay.jsx";

export default function UpdateProfile({ user, setOpenUpdate }) {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fields, setFields] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    city: user.city || "Non renseigné",
  });

  const { userId } = useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const updateMutation = useMutation(
    (updatedUser) => {
      return makeRequest.put("/users", updatedUser);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["user", userId]);
        toast.success("Profile updated.");
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();

    const newCover = cover ? await uploadFile(cover) : user.coverPic;
    const newProfile = profile ? await uploadFile(profile) : user.profilePic;

    // Check if form fields have been modified
    const isAnyFieldModified = Object.keys(fields).some(
      (field) => fields[field] !== user[field]
    );

    if (!isAnyFieldModified && !cover && !profile) {
      toast.info("No changes detected.");
      return;
    }

    // Update user's data
    const updatedUser = {
      ...user,
      ...fields,
      coverPic: newCover,
      profilePic: newProfile,
    };

    // Update user in global context
    setCurrentUser(updatedUser);

    // Send mutation to database
    updateMutation.mutate(updatedUser);

    navigate(`/profile/${currentUser.id}`);
  };

  return (
    <>
      <div className="update">
        <div className="wrapper">
          <h1>Update Your Profile</h1>

          <form>
            <div className="files">
              <label htmlFor="cover">
                <span>Cover Picture</span>
                <div className="imgContainer">
                  <img
                    src={
                      cover
                        ? URL.createObjectURL(cover)
                        : user.coverPic
                        ? `/uploads/${user.coverPic}`
                        : defaultCover
                    }
                    alt="cover"
                  />
                  <CloudUploadIcon className="icon" />
                </div>
              </label>

              <input
                type="file"
                id="cover"
                style={{ display: "none" }}
                onChange={(e) => setCover(e.target.files[0])}
              />

              <label htmlFor="profile">
                <span>Profile Picture</span>
                <div className="imgContainer">
                  <img
                    src={
                      profile
                        ? URL.createObjectURL(profile)
                        : user.profilePic
                        ? `/uploads/${user.profilePic}`
                        : defaultProfile
                    }
                    alt="profile"
                  />
                  <CloudUploadIcon className="icon" />
                </div>
              </label>

              <input
                type="file"
                id="profile"
                style={{ display: "none" }}
                onChange={(e) => setProfile(e.target.files[0])}
              />
            </div>

            <label>First name</label>
            <input
              type="text"
              value={fields.firstName}
              name="firstName"
              onChange={handleChange}
              autoComplete="off"
            />

            <label>Last name</label>
            <input
              type="text"
              value={fields.lastName}
              name="lastName"
              onChange={handleChange}
              autoComplete="off"
            />

            <label>City</label>
            <input
              type="text"
              name="city"
              value={fields.city}
              onChange={handleChange}
              autoComplete="off"
            />

            <button onClick={handleClick}>Update</button>
          </form>

          <button className="close" onClick={() => setOpenUpdate(false)}>
            X
          </button>
        </div>
      </div>

      <Overlay />
    </>
  );
}
