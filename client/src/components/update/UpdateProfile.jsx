import { useContext, useState } from "react";
import "./updateProfile.scss";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { upload } from "../../utils/upload.js";
import { toast } from "react-toastify";

// Icon
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Images
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";
import defaultCover from "../../assets/images/users/defaultCover.jpeg";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

// Component
import Overlay from "../overlay/Overlay.jsx";

export default function UpdateProfile({ user, toggleUpdate }) {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [fields, setFields] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    city: user.city,
  });
  const [profilePic, setProfilePic] = useState(null);
  const [coverPic, setCoverPic] = useState(null);
  const [profileUrl, setProfileUrl] = useState(user.profilePic);
  const [coverUrl, setCoverUrl] = useState(user.coverPic || defaultCover);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updatedUser) => makeRequest.put("/users", updatedUser),
    onSuccess: () => {
      queryClient.invalidateQueries(["user", currentUser.id]);
      toast.success("Profile updated.");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    const newCoverUrl = coverPic ? await upload(coverPic) : coverUrl;
    const newProfileUrl = profilePic ? await upload(profilePic) : profileUrl;

    // Update current with new data
    const updatedUser = {
      ...currentUser, // Utilise les données actuelles de currentUser
      ...fields,
      coverPic: newCoverUrl,
      profilePic: newProfileUrl,
    };

    // Update user's global state in AuthContext
    setCurrentUser(updatedUser);

    // Send mutation to database
    updateMutation.mutate(updatedUser);

    navigate(`/profile/${currentUser.id}`);
  };

  // Handle file change for profile or cover picture
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);

      if (type === "profile") {
        setProfilePic(file);
        setProfileUrl(previewUrl); // Preview new profile pic
      } else if (type === "cover") {
        setCoverPic(file);
        setCoverUrl(previewUrl); // Preview new cover pic
      }
    }
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
                <div className="img-container">
                  <img
                    src={
                      coverPic
                        ? URL.createObjectURL(coverPic)
                        : currentUser.coverPic
                        ? `/uploads/${currentUser.coverPic}`
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
                name="cover"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, "cover")}
              />

              <label htmlFor="profile">
                <span>Profile Picture</span>
                <div className="img-container">
                  <img
                    src={
                      profilePic
                        ? URL.createObjectURL(profilePic)
                        : currentUser.profilePic
                        ? `/uploads/${currentUser.profilePic}`
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
                name="profile"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, "profile")}
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

          <button className="close" onClick={toggleUpdate}>
            X
          </button>
        </div>
      </div>

      <Overlay />
    </>
  );
}
