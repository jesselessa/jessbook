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
  const { setCurrentUser } = useContext(AuthContext);
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
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (e.target.id === "selected-cover") setCover(selectedFile);
    if (e.target.id === "selected-profile") setProfile(selectedFile);
  };

  // Mutation to update user's data
  const updateMutation = useMutation({
    mutationFn: (updatedUser) => makeRequest.put("/users", updatedUser),

    onSuccess: (_data, variables) => {
      // 1. Update cache immediately with updated user's data
      //! 'setQueryData' is usually used to update data locally before receiving confirmation from server
      queryClient.setQueryData(["user", userId], (oldData) => ({
        ...oldData,
        ...variables, // new user's data passed to mutate
      }));

      // 2. Update AuthContext with new data
      setCurrentUser((prevUser) => ({
        ...prevUser,
        ...variables,
      }));

      toast.success("Profile updated.");
      setOpenUpdate(false); // Close form
    },

    onError: (error) => {
      toast.error("Error updating profile.");
      throw new Error(error);
    },
  });

  // Handle form submission
  const handleClick = async (e) => {
    e.preventDefault();

    // Upload new cover and profile pictures if present
    const newCover = cover ? await uploadFile(cover) : user.coverPic;
    const newProfile = profile ? await uploadFile(profile) : user.profilePic;

    // Check if form fields or images have been modified
    const isAnyFieldModified = Object.keys(fields).some(
      (field) => fields[field] !== user[field]
    ); //! Object.keys(object) returns an array with the object string-keyed property names

    const isCoverModified =
      cover && cover !== user.coverPic && user.coverPic !== defaultCover;

    const isProfileModified =
      profile &&
      profile !== user.profilePic &&
      user.profilePic !== defaultProfile;

    if (!isAnyFieldModified && !isCoverModified && !isProfileModified) {
      toast.info("No changes detected.");
      return;
    }

    // Prepare updated user data
    const updatedUser = {
      ...user,
      ...fields,
      coverPic: newCover,
      profilePic: newProfile,
    };

    // Update images
    setCover(newCover);
    setProfile(newProfile);

    // Trigger mutation to update database
    updateMutation.mutate(updatedUser);

    // Reset images state to release URL resources
    setCover(null);
    setProfile(null);

    // Go to user's updated profile page
    navigate(`/profile/${updatedUser.id}`);
  };

  return (
    <>
      <div className="update">
        <div className="wrapper">
          <h1>Update Your Profile</h1>

          <form name="update-profile-form">
            <div className="files">
              <div className="cover">
                <span>Cover Picture</span>

                <div className="img-container">
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
                  <label htmlFor="selected-cover">
                    <CloudUploadIcon className="icon" />
                  </label>
                </div>
              </div>

              <input
                type="file"
                id="selected-cover"
                name="selected-cover"
                accept="image/*"
                onChange={handleFileChange}
              />

              <div className="profile">
                <span>Profile Picture</span>

                <div className="img-container">
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
                  <label htmlFor="selected-profile">
                    <CloudUploadIcon className="icon" />
                  </label>
                </div>
              </div>

              <input
                type="file"
                id="selected-profile"
                name="selected-profile"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              minLength={2}
              maxLength={35}
              value={fields.firstName}
              onChange={handleFieldChange}
              autoComplete="off"
            />

            <label htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              minLength={1}
              maxLength={35}
              value={fields.lastName}
              onChange={handleFieldChange}
              autoComplete="off"
            />

            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              maxLength={85}
              value={fields.city}
              onChange={handleFieldChange}
              autoComplete="off"
            />

            <button type="submit" onClick={handleClick}>
              Update
            </button>
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
