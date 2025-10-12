import { useContext, useState } from "react";
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

export default function UpdateProfile({ user, setIsOpen }) {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [cover, setCover] = useState(null); // 'cover' and 'profile' are either null or File object (Blob) when selected
  const [profile, setProfile] = useState(null);
  const [fields, setFields] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    city: user.city,
  });
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    city: "",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Generate preview URLs and cleanup automatically
  const coverUrl = useCleanUpFileURL(cover);
  const profileUrl = useCleanUpFileURL(profile);

  // Handle form fields changes
  const handleInputsChange = (e) => {
    const { name, value } = e.target;
    // Immediate cleanup: Reset previous validation errors
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    // Bind inputs value to state
    setFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  // Clear form validation errors
  const clearValidationErrors = () => {
    setValidationErrors({
      firstName: "",
      lastName: "",
      city: "",
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    clearValidationErrors(); // Delete previous errors
    const selectedFile = e.target.files[0];
    if (e.target.id === "selected-cover") setCover(selectedFile);
    else setProfile(selectedFile);
  };

  // Optimistic mutation for profile update
  const updateMutation = useMutation({
    // 1. mutationFn: Upload files and send PUT request
    mutationFn: async ({ updatedFields, coverFile, profileFile }) => {
      const uploadedCover = coverFile
        ? await uploadFile(coverFile)
        : user.coverPic;
      const uploadedProfile = profileFile
        ? await uploadFile(profileFile)
        : user.profilePic;

      // Final object for the PUT request
      const finalUpdate = {
        ...updatedFields,
        coverPic: uploadedCover,
        profilePic: uploadedProfile,
      };

      await makeRequest.put("/users", finalUpdate);
      return { userId: user.id, ...finalUpdate };
      // Note: 'userId' is semantic alias that we chose to make the return value more meaningful and easier to use within other TanStack Query hooks, even if our server simply calls that data 'id'
    },

    // 2. onMutate (Fast): Optimistic cache update
    onMutate: async ({ updatedFields, coverFile, profileFile }) => {
      // Cancel any outgoing refetches for user and posts data
      await queryClient.cancelQueries(["user", user.id]);
      await queryClient.cancelQueries(["posts", user.id]);

      // Store the current cached data to revert if mutation fails
      const previousUser = queryClient.getQueryData(["user", user.id]);
      const previousPosts = queryClient.getQueryData(["posts", user.id]);

      // Create Blob URLs locally for the optimistic cache update
      // These URLs will be applied to the main profile page display temporarily
      const tempCoverUrl = coverFile
        ? URL.createObjectURL(coverFile)
        : user.coverPic || defaultCover;
      const tempProfileUrl = profileFile
        ? URL.createObjectURL(profileFile)
        : user.profilePic || defaultProfile;

      // Optimistically update the cache: ProfileData must be able to read this 'blob:' URL
      //! ⚠️ Merge only updated fields to prevent overwriting other data !!!
      queryClient.setQueryData(["user", currentUser.id], (oldData) => ({
        ...oldData,
        ...updatedFields,
        // Update with temporary URL if a new file is selected
        coverPic: coverFile ? tempCoverUrl : oldData.coverPic,
        profilePic: profileFile ? tempProfileUrl : oldData.profilePic,
      }));

      // Clear error messages
      clearValidationErrors();

      return { previousUser, previousPosts, tempCoverUrl, tempProfileUrl };
    },

    // 3. onError: Rollback on failure
    onError: (error, _variables, context) => {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data || error.message);

      if (context?.previousUser) {
        queryClient.setQueryData(
          ["user", currentUser.id],
          context.previousUser
        );
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(
          ["posts", currentUser.id],
          context.previousPosts
        );
      }

      // Note: We don't need to revoke hook URLs here, as the hook handles its cleanup
    },

    // 4. onSuccess: Close form, toast and navigate
    onSuccess: (_data, variables) => {
      //? 'updatedUser' is the object that 'mutate' will pass to our 'mutationFn' (updated user's data)
      toast.success("Profile updated.");
      clearValidationErrors();
      setIsOpen(false); // Close form
      navigate(`/profile/${variables.id}`);
    },

    // 5. onSettled: Cleanup and refetch
    onSettled: (_data, _error, _variables, context) => {
      // Revoke the Blob URLs manually created in onMutate to prevent memory leaks, since the final URL is now fetched from the server
      if (context?.tempCoverUrl && context.tempCoverUrl.startsWith("blob:"))
        URL.revokeObjectURL(context.tempCoverUrl);
      if (context?.tempProfileUrl && context.tempProfileUrl.startsWith("blob:"))
        URL.revokeObjectURL(context.tempProfileUrl);

      queryClient.invalidateQueries(["user", currentUser.id]);
      queryClient.invalidateQueries(["posts", currentUser.id]);

      // Clean up local File objects (whereas our hook deals with their URL)
      setCover(null);
      setProfile(null);
    },
  });

  // Use 'updateMutation.isPending' for the global loading state
  const isUpdating = updateMutation.isPending;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isUpdating) return;

    // Handle validation errors
    let inputsErrors = {};

    const { firstName, lastName, city } = fields;

    if (firstName?.trim()?.length < 2 || firstName?.trim()?.length > 35) {
      inputsErrors.firstName = "Enter a name between 2 and 35\u00A0characters.";
    }

    if (lastName?.trim()?.length < 1 || lastName?.trim()?.length > 35) {
      inputsErrors.lastName = "Enter a name between 1 and 35\u00A0characters.";
    }

    if (city?.trim()?.length > 85) {
      inputsErrors.city = "Enter a valid city name (max 85\u00A0characters).";
    }

    // Stop process if errors
    //? 'Object.keys(object)' returns an array with the object string-keyed property names
    if (Object.keys(inputsErrors).length > 0) {
      setValidationErrors(inputsErrors);
      return;
    }

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

    // Prepare updated data
    const newCity =
      fields.city?.trim().length > 0 ? fields.city.trim() : "Undefined";

    const updatedFields = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      city: newCity,
    };

    // Trigger mutation immediately
    updateMutation.mutate({
      updatedFields,
      coverFile: cover,
      profileFile: profile,
    });
  };

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

                <input
                  type="file"
                  id="selected-cover"
                  name="selected-cover"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUpdating}
                />
              </div>

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

                <input
                  type="file"
                  id="selected-profile"
                  name="selected-profile"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUpdating}
                />
              </div>
            </div>

            {/* Form fields */}
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={fields.firstName}
              onChange={handleInputsChange}
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
              onChange={handleInputsChange}
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
              onChange={handleInputsChange}
              autoComplete="off"
              disabled={isUpdating}
            />
            {validationErrors.city && (
              <span className="error-msg">{validationErrors.city}</span>
            )}

            {/* Update button */}
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
            type="button"
            className="close"
            onClick={() => setIsOpen(false)}
            disabled={isUpdating}
          >
            X
          </button>
        </div>
      </div>
    </>
  );
}
