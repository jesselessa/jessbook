import { useContext, useState } from "react";
import "./updateProfile.scss";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { useCleanUpFileURL } from "../../hooks/useCleanUpFileURL.js";
import { toast } from "react-toastify";

// Component
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";

// Icon
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Images
import defaultCover from "../../assets/images/users/defaultCover.jpeg";
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function UpdateProfile({ user, setOpenUpdate }) {
  const { setCurrentUser } = useContext(AuthContext);
  const [cover, setCover] = useState(null); // Cover pic present or not
  const [profile, setProfile] = useState(null); // Profile pic present or not
  const [fields, setFields] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    city: user.city,
  });
  // Errors from form
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    city: "",
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

  // Mutation to update user data
  const updateMutation = useMutation({
    mutationFn: (updatedUser) => makeRequest.put("/users", updatedUser),

    onSuccess: (_data, variables) => {
      // 1. Update cache immediately with updated user data
      //! 'setQueryData' is usually used to update data locally before receiving confirmation from server
      queryClient.setQueryData(["user", userId], (oldData) => ({
        ...oldData,
        ...variables, // new user data passed to mutate
      }));

      // 2. Update AuthContext with new data
      setCurrentUser((prevUser) => ({
        ...prevUser,
        ...variables,
      }));

      toast.success("Profile updated.");
    },

    onError: (error) => console.error("Error updating profile:", error),
  });

  // Clear validation errors in form
  const clearValidationErrors = () =>
    setValidationErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      pswdConfirm: "",
    });

  // Handle form submission
  const handleClick = async (e) => {
    e.preventDefault();

    // Handle validation errors
    let inputsErrors = {};

    const { firstName, lastName, city } = fields;

    if (firstName?.trim()?.length < 2 || firstName?.trim()?.length > 35)
      inputsErrors.firstName = "Enter a name between 2 and 35 characters.";

    if (lastName?.trim()?.length < 1 || lastName?.trim()?.length > 35)
      inputsErrors.lastName = "Enter a name between 1 and 35 characters.";

    if (city?.trim()?.length > 85)
      inputsErrors.city = "Enter a valid city name.";

    // If errors during validation, update state and stop process
    if (Object.keys(inputsErrors).length > 0) {
      setValidationErrors(inputsErrors);

      // Clear error messages after 5 seconds
      setTimeout(() => {
        clearValidationErrors();
      }, 5000);

      return;
    }

    // Check if form fields or images have been modified
    const isAnyFieldModified = Object.keys(fields).some(
      (field) => fields[field] !== user[field]
    ); // Object.keys(object) returns an array with the object string-keyed property names

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

    // Upload new cover and profile pictures if present
    const newCover = cover ? await uploadFile(cover) : user.coverPic;
    const newProfile = profile ? await uploadFile(profile) : user.profilePic;

    // Prepare updated data
    const updatedUser = {
      ...user,
      ...fields,
      coverPic: newCover,
      profilePic: newProfile,
    };

    // Update images states
    setCover(newCover);
    setProfile(newProfile);

    // Trigger mutation to update database
    updateMutation.mutate(updatedUser);
    setOpenUpdate(false); // Close form

    // Reset images states to release URL resources
    setCover(null);
    setProfile(null);

    // Go to user updated profile page
    navigate(`/profile/${updatedUser.id}`);
  };

  // Release URL resources to prevent memory leaks
  useCleanUpFileURL(cover);
  useCleanUpFileURL(profile);

  return (
    <>
      <div className="update">
        <div className="wrapper">
          <h1>Update Your Profile</h1>

          <form name="update-profile-form">
            <div className="files">
              {/* Profile pic */}
              <div className="profile">
                <span>Profile Picture</span>

                <div className="img-container">
                  <LazyLoadImage
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

            {/* Cover pic */}
            <div className="cover">
              <span>Cover Picture</span>

              <div className="img-container">
                <LazyLoadImage
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

            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              maxLength={35}
              value={fields.firstName}
              onChange={handleFieldChange}
              autoComplete="off"
            />
            {validationErrors.firstName && (
              <span className="error-msg">{validationErrors.firstName}</span>
            )}

            <label htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              maxLength={35}
              value={fields.lastName}
              onChange={handleFieldChange}
              autoComplete="off"
            />
            {validationErrors.lastName && (
              <span className="error-msg">{validationErrors.lastName}</span>
            )}

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
            {validationErrors.city && (
              <span className="error-msg">{validationErrors.city}</span>
            )}

            <button type="submit" onClick={handleClick}>
              Update
            </button>
          </form>

          <button className="close" onClick={() => setOpenUpdate(false)}>
            X
          </button>
        </div>
      </div>
    </>
  );
}
