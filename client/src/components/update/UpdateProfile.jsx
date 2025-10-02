import { useContext, useState, useRef } from "react";
import "./updateProfile.scss";
import { useNavigate } from "react-router-dom";
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
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  // 'cover' and 'profile' are either null or File object (Blob) when selected
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
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

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Call our custom hook to generate a preview URL and manage its cleanup automatically
  const coverUrl = useCleanUpFileURL(cover);
  const profileUrl = useCleanUpFileURL(profile);

  // Handle form fields changes
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFields((prevFields) => ({ ...prevFields, [name]: value }));

    // Immediate cleanup: The error is cleared as soon as the user starts typing
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle image change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (e.target.id === "selected-cover") setCover(selectedFile);
    if (e.target.id === "selected-profile") setProfile(selectedFile);
  };

  // Optimistic mutation for profile update
  const updateMutation = useMutation({
    mutationFn: (updatedUser) => makeRequest.put("/users", updatedUser),

    // Optimistic update: Apply changes immediately in cache
    onMutate: async (updatedUser) => {
      // Cancel any outgoing refetch
      await queryClient.cancelQueries(["user", currentUser.id]);
      // Store the current states
      const previousUser = queryClient.getQueryData(["user", currentUser.id]);
      const previousPosts = queryClient.getQueryData(["posts", currentUser.id]);

      // Optimistically update to the new value
      //? 'setQueryData' is usually used to update data locally before receiving confirmation from server → UI reflects the changes instantly
      //! ⚠️ Reminder: Don't merge an uncomplete optimistic object (e.g., if we only return 'firstName' and 'lastName', whereas 'users' SQL table also contains other keys), in this case 'updatedProfile',because it will overwrite our existing data => 💡 Only merge with the new one !!!
      queryClient.setQueryData(["user", currentUser.id], (oldData) => ({
        ...oldData,
        ...Object.fromEntries(
          // Only adds/overwrites new data
          Object.entries(updatedUser) // Object.entries(updatedUser) transforms an oject into an array with key-value pairs
            .filter(([_key, value]) => value !== undefined) // We only keep defined values
        ),
      }));

      // Update user's profile immediately
      setCurrentUser((prev) => ({ ...prev, ...updatedUser }));

      // Return context with previous data for rollback in case of error
      return { previousUser, previousPosts };
    },

    // Rollback if mutation fails
    onError: (err, _updatedUser, context) => {
      if (context?.previousUser)
        queryClient.setQueryData(
          ["user", currentUser.id],
          context.previousUser
        );
      if (context?.previousPosts)
        queryClient.setQueryData(
          ["posts", currentUser.id],
          context.previousPosts
        );

      console.error("Error updating profile:", err);
      toast.error(
        "Error updating profile: " +
          (err.response?.data?.message || err.message)
      );
    },

    // On success, display a message and navigate to profile page
    onSuccess: (_data, updatedUser) => {
      //? 'variables' is an object that 'mutate' will pass to our 'mutationFn' (in this case, the new user data)
      toast.success("Profile updated successfully.");
      navigate(`/profile/${updatedUser.id}`);
    },

    onSettled: () => {
      // Invalidate and refetch user's query and dependent queries
      queryClient.invalidateQueries(["user", currentUser.id]);
      queryClient.invalidateQueries({ queryKey: ["posts", currentUser.id] });

      // Reset states
      setOpenUpdate(false);
      setCover(null);
      setProfile(null);

      // Reset input value in DOM
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  // Clear form validation errors
  const clearValidationErrors = () =>
    setValidationErrors({
      firstName: "",
      lastName: "",
      city: "",
    });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isUpdating) return;

    // Handle validation errors
    let inputsErrors = {};

    const { firstName, lastName, city } = fields;

    if (firstName?.trim()?.length < 2 || firstName?.trim()?.length > 35)
      inputsErrors.firstName = "Enter a name between 2 and 35\u00A0characters.";

    if (lastName?.trim()?.length < 1 || lastName?.trim()?.length > 35)
      inputsErrors.lastName = "Enter a name between 1 and 35\u00A0characters.";

    if (city && city?.trim()?.length > 85)
      inputsErrors.city = "Enter a valid city name (up to 85\u00A0characters).";

    // Stop process if errors
    //? 'Object.keys(object)' returns an array with the object string-keyed property names
    if (Object.keys(inputsErrors).length > 0) {
      setValidationErrors(inputsErrors);
      return;
    }

    // Ensure to cleanup errors (e.g. previous errors made but corrected before submission)
    clearValidationErrors();

    // Check if form fields or images have been modified
    const isAnyFieldModified = Object.keys(fields).some(
      (field) => fields[field]?.trim() !== (user[field] || "")?.trim()
    );

    const isCoverModified = cover !== null;
    const isProfileModified = profile !== null;

    if (!isAnyFieldModified && !isCoverModified && !isProfileModified) {
      toast.info("No changes detected.");
      return;
    }

    // Upload new cover and profile pictures if selected
    const newCover = cover ? await uploadFile(cover) : user.coverPic;
    const newProfile = profile ? await uploadFile(profile) : user.profilePic;

    // Prepare updated data
    const updatedUser = {
      ...fields, // Keys-values modified by the form
      id: currentUser.id, // Ensure ID is included in the PUT request
      coverPic: newCover,
      profilePic: newProfile,
    };

    // Trigger optimistic mutation
    updateMutation.mutate(updatedUser);
  };

  // Use 'updateMutation.isPending' for the global loading state
  //? 'isPending 'is a property automatically managed by the Tanstack Query useMutation hook
  //? When we call useMutation, the returned object contains several states, such as 'isPending' ('true' while mutationFn is running), 'isSuccess' ('true' if mutation success) or 'isError' ('true' if mutation failure)
  const isUpdating = updateMutation.isPending;

  return (
    <>
      <div className="update">
        <div className="wrapper">
          <h1>Update Your Profile</h1>

          <form name="update-profile-form" onSubmit={handleSubmit}>
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
                ref={fileInputRef}
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
              value={fields.city}
              onChange={handleFieldChange}
              autoComplete="off"
              disabled={isUpdating}
            />
            {validationErrors.city && (
              <span className="error-msg">{validationErrors.city}</span>
            )}

            <button type="submit" disabled={isUpdating}>
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
