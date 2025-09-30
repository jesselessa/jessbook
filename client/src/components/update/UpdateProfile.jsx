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
import Loader from "../loader/Loader.jsx";

// Icon
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Images
import defaultCover from "../../assets/images/users/defaultCover.jpeg";
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function UpdateProfile({ user, setOpenUpdate }) {
  const { setCurrentUser } = useContext(AuthContext);

  // 'cover' and 'profile' hold the File object or null
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fields, setFields] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    city: user.city,
  });

  // Errors from form (including future changes)
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    city: "",
  });

  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Call our custom hook to generate the preview URL and manage its cleanup automatically
  const coverUrl = useCleanUpFileURL(cover);
  const profileUrl = useCleanUpFileURL(profile);

  // Handle form fields changes
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFields((prevFields) => ({ ...prevFields, [name]: value }));

    // Immediate cleanup: the error is cleared as soon as the user starts typing
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
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
      //? 'variables' is an object that mutate will pass to our mutationFn (in this case, the new user data)

      // 1. Update the specific user query cache to refresh the profile page
      //! Note: 'setQueryData' is usually used to update data locally before receiving confirmation from server
      queryClient.setQueryData(["user", userId], (oldData) => ({
        ...oldData,
        ...variables,
      }));

      // 2. Update AuthContext with new data
      setCurrentUser((prevUser) => ({
        ...prevUser,
        ...variables,
      }));

      // 3. Invalidate and refetch user query and also dependent queries (like posts and comments) displaying user data
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });

      toast.success("Profile updated.");

      // 4. Close the form and navigate to profile
      setOpenUpdate(false);
      navigate(`/profile/${variables.id}`);

      // 5. Cleanup the file state
      setCover(null);
      setProfile(null);
    },

    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error(
        "Error updating profile: " + error.response?.data?.message ||
          error.message
      );
    },
  });

  // Clear validation errors in form
  const clearValidationErrors = () =>
    setValidationErrors({
      firstName: "",
      lastName: "",
      city: "",
    });

  // Handle form submission
  const handleClick = async (e) => {
    e.preventDefault();

    // Handle validation errors
    let inputsErrors = {};

    const { firstName, lastName, city } = fields;

    if (firstName?.trim()?.length < 2 || firstName?.trim()?.length > 35)
      inputsErrors.firstName = "Enter a name between 2 and 35\u00A0characters.";

    if (lastName?.trim()?.length < 1 || lastName?.trim()?.length > 35)
      inputsErrors.lastName = "Enter a name between 1 and 35\u00A0characters.";

    if (city && city?.trim()?.length > 85)
      inputsErrors.city = "Enter a valid city name (max 85\u00A0characters).";

    // Stop process if errors
    //? 'Object.keys(object)' returns an array with the object string-keyed property names
    if (Object.keys(inputsErrors).length > 0) {
      setValidationErrors(inputsErrors);
      return;
    }

    // Ensure to cleanup errors (e.g. previous errors made but corrected before submission)
    setValidationErrors({ firstName: "", lastName: "", city: "" });

    // Check if form fields or images have been modified
    // 1. Check fields modification (using trim() for robust comparison)
    const isAnyFieldModified = Object.keys(fields).some(
      (field) => fields[field]?.trim() !== (user[field] || "")?.trim()
    );

    // 2. Check if cover or profile have been modified
    // Reminder: 'cover' and 'profile' states are either 'null' or File object as soon as a file is selected ; therefore, the presence of a File object in their state indicates a change
    const isCoverModified = cover !== null;
    const isProfileModified = profile !== null;

    if (!isAnyFieldModified && !isCoverModified && !isProfileModified) {
      toast.info("No changes detected.");
      return;
    }

    // Upload new cover and profile pictures if present
    const newCover = cover ? await uploadFile(cover) : user.coverPic;
    const newProfile = profile ? await uploadFile(profile) : user.profilePic;

    // Prepare updated data
    const updatedUser = {
      ...user, // Include all existing properties
      ...fields, // Smashed them with the properties modified by the form
      id: userId, // Ensure ID is included in the PUT request
      coverPic: newCover,
      profilePic: newProfile,
    };

    // Trigger mutation to update database
    updateMutation.mutate(updatedUser);
  };

  // Use updateMutation.isPending for the global loading state
  //?'isPending 'is a property automatically managed by the Tanstack Query useMutation hook
  //? When we call useMutation, the returned object contains several states, such as 'isPending' ('true' while mutationFn is running), 'isSuccess' ('true' if mutation success) or 'isError' ('true' if mutation failure)
  const isUpdating = updateMutation.isPending;

  return (
    <>
      <div className="update">
        <div className="wrapper">
          <h1>Update Your Profile</h1>

          <form name="update-profile-form">
            <div className="files">
              {/* Cover pic */}
              <div className="cover">
                <span>Cover Picture</span>
                <div className="img-container">
                  <LazyLoadImage
                    src={
                      coverUrl
                        ? coverUrl // 1. Preview URL when file is selected
                        : user.coverPic // 2. Existing image in DB
                        ? `/uploads/${user.coverPic}`
                        : defaultCover // 3. Default image
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
                disabled={isUpdating}
              />

              {/* Profile pic */}
              <div className="profile">
                <span>Profile Picture</span>

                <div className="img-container">
                  <LazyLoadImage
                    src={
                      profileUrl
                        ? profileUrl
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
                disabled={isUpdating}
              />
            </div>

            {/* Other info */}
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              maxLength={35}
              value={fields.firstName}
              onChange={handleFieldChange}
              autoComplete="off"
              disabled={isUpdating}
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
              disabled={isUpdating}
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
              disabled={isUpdating}
            />
            {validationErrors.city && (
              <span className="error-msg">{validationErrors.city}</span>
            )}

            <button type="submit" onClick={handleClick} disabled={isUpdating}>
              {updateMutation.isPending ? (
                <Loader
                  width="24px"
                  height="24px"
                  border="3px solid rgba(0, 0, 0, 0.1)"
                />
              ) : (
                "Update"
              )}
            </button>
          </form>

          <button
            className="close"
            onClick={() => setOpenUpdate(false)}
            disabled={isUpdating}
          >
            X
          </button>
        </div>
      </div>
    </>
  );
}
