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

  // Handle form fields changes
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  // Handle image change
  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    setImage(file);
  };

  // Mutation to update user's profile data
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload new cover and profile pictures if present
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

    // Prepare updated user data
    const updatedUser = {
      ...currentUser,
      ...fields,
      coverPic: newCover,
      profilePic: newProfile,
    };

    // Update user's data in global context
    setCurrentUser(updatedUser);
    setCover(newCover);
    setProfile(newProfile);

    // Trigger mutation to update user's data in database
    updateMutation.mutate(updatedUser);

    // Go to user's updated profile page
    navigate(`/profile/${updatedUser.id}`);
  };

  return (
    <>
      <div className="update">
        <div className="wrapper">
          <h1>Update Your Profile</h1>

          <form name="update-profile-form" onSubmit={handleSubmit}>
            <div className="files">
              <div className="cover">
                <span>Cover Picture</span>
                <div className="img-container">
                  <img
                    src={
                      cover
                        ? URL.createObjectURL(cover)
                        : currentUser.coverPic
                        ? `/uploads/${currentUser.coverPic}`
                        : defaultCover
                    }
                    alt="cover"
                  />
                  <CloudUploadIcon className="icon" />
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImageChange(e, setCover)}
              />

              <div className="profile">
                <span>Profile Picture</span>
                <div className="img-container">
                  <img
                    src={
                      profile
                        ? URL.createObjectURL(profile)
                        : currentUser.profilePic
                        ? `/uploads/${currentUser.profilePic}`
                        : defaultProfile
                    }
                    alt="profile"
                  />
                  <CloudUploadIcon className="icon" />
                </div>
              </div>

              <input
                type="file"
                style={{ display: "none" }}
                onChange={(e) => handleImageChange(e, setCover)}
              />
            </div>

            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={fields.firstName}
              onChange={handleFieldChange}
              autoComplete="off"
            />

            <label htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={fields.lastName}
              onChange={handleFieldChange}
              autoComplete="off"
            />

            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={fields.city}
              onChange={handleFieldChange}
              autoComplete="off"
            />

            <button type="submit">Update</button>
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
