import { useContext, useState } from "react";
import "./updateProfile.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../utils/axios.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { useCleanUpFileURL } from "../../hooks/useCleanUpFileURL.js";
import { toast } from "react-toastify";

// Components
import LazyLoadImage from "../lazyLoadImage/LazyLoadImage.jsx";
import Loader from "../loader/Loader.jsx";

// Icon
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Images
import defaultCover from "../../assets/images/users/defaultCover.jpeg";
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Context
import { AuthContext } from "../../contexts/AuthContext.jsx";

export default function UpdateProfile({ user, setIsOpen }) {
  const { setCurrentUser } = useContext(AuthContext);

  const [cover, setCover] = useState(null);
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

  const coverUrl = useCleanUpFileURL(cover);
  const profileUrl = useCleanUpFileURL(profile);

  const handleInputsChange = (e) => {
    const { name, value } = e.target;
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    setFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const clearValidationErrors = () => {
    setValidationErrors({ firstName: "", lastName: "", city: "" });
  };

  const handleFileChange = (e) => {
    clearValidationErrors();
    const selectedFile = e.target.files[0];
    if (e.target.id === "selected-cover") setCover(selectedFile);
    else setProfile(selectedFile);
  };

  const updateMutation = useMutation({
    mutationFn: async ({ updatedFields, coverFile, profileFile }) => {
      const uploadedCover = coverFile
        ? await uploadFile(coverFile)
        : user.coverPic
        ? user.coverPic
        : null;
      const uploadedProfile = profileFile
        ? await uploadFile(profileFile)
        : user.profilePic
        ? user.profilePic
        : null;

      const finalUpdate = {
        ...updatedFields,
        coverPic: uploadedCover,
        profilePic: uploadedProfile,
      };

      const res = await makeRequest.put("/users", finalUpdate);
      return res.data;
    },

    onMutate: async ({ updatedFields, coverFile, profileFile }) => {
      const userId = String(user.id);

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(["user", userId]);
      await queryClient.cancelQueries(["posts", userId]);
      await queryClient.cancelQueries(["posts"]);
      await queryClient.cancelQueries(["stories", userId]);

      // Store current states to rollback if needed
      const previousUser = queryClient.getQueryData(["user", userId]);
      const previousUserPosts = queryClient.getQueryData(["posts", userId]);
      const previousGlobalPosts = queryClient.getQueryData(["posts"]);
      const previousStories = queryClient.getQueryData(["stories", userId]);

      // Generate temporary URLs for optimistic update
      const tempCoverUrl = coverFile
        ? URL.createObjectURL(coverFile) // New image
        : user.coverPic
        ? user.coverPic // Old image
        : null; // User has never set a cover pic before
      const tempProfileUrl = profileFile
        ? URL.createObjectURL(profileFile)
        : user.profilePic
        ? user.profilePic
        : null;

      // Create an optimistic user
      const optimisticUser = {
        ...user,
        ...updatedFields,
        profilePic: tempProfileUrl,
        coverPic: tempCoverUrl,
      };

      // Optimistically update localStorage and TQ cache immediately
      setCurrentUser(optimisticUser);
      queryClient.setQueryData(["user", userId], optimisticUser);

      // Update posts with optimistic user data
      const applyOptimisticUpdate = (old = []) =>
        old.map((p) =>
          p.userId === user.id
            ? {
                ...p,
                firstName: optimisticUser.firstName,
                lastName: optimisticUser.lastName,
                profilePic: optimisticUser.profilePic,
              }
            : p
        );

      queryClient.setQueryData(["posts", userId], applyOptimisticUpdate);
      queryClient.setQueryData(["posts"], applyOptimisticUpdate);

      return {
        previousUser,
        previousUserPosts,
        previousGlobalPosts,
        previousStories,
        tempCoverUrl,
        tempProfileUrl,
      };
    },

    // --- ROLLBACK ---
    onError: (error, _variables, context) => {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || error.message);

      const userId = String(user.id);

      if (context?.previousUser) {
        queryClient.setQueryData(["user", userId], context.previousUser);
      }
      if (context?.previousUserPosts) {
        queryClient.setQueryData(["posts", userId], context.previousUserPosts);
      }
      if (context?.previousGlobalPosts) {
        queryClient.setQueryData(["posts"], context.previousGlobalPosts);
      }
      if (context?.previousStories) {
        queryClient.setQueryData(["stories", userId], context.previousStories);
      }
    },

    // --- SUCCESS ---
    onSuccess: (data) => {
      const userId = String(data.id);

      toast.success("Profile updated successfully.");
      setIsOpen(false);

      // Update local state and TQ cache immediately with final server response
      const updatedUserData = {
        ...user,
        ...data,
      };

      setCurrentUser(updatedUserData);

      // Invalidate and refetch user and other related queries
      queryClient.invalidateQueries(["user", userId]);
      queryClient.invalidateQueries(["posts", userId]);
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["stories", userId]);
    },

    // --- CLEANUP ---
    onSettled: (_data, _error, _variables, context) => {
      // Revoke the Blob URLs manually created in onMutate to prevent memory leaks
      if (context?.tempCoverUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(context.tempCoverUrl);
      }
      if (context?.tempProfileUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(context.tempProfileUrl);
      }

      // Clean up local File objects
      setCover(null);
      setProfile(null);
    },
  });

  const isUpdating = updateMutation.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUpdating) return;

    let inputsErrors = {};
    const { firstName, lastName, city } = fields;

    if (firstName?.trim()?.length < 2 || firstName?.trim()?.length > 35)
      inputsErrors.firstName = "Enter a name between 2 and 35 characters.";
    if (lastName?.trim()?.length < 1 || lastName?.trim()?.length > 35)
      inputsErrors.lastName = "Enter a name between 1 and 35 characters.";
    if (city?.trim()?.length > 85)
      inputsErrors.city = "Enter a valid city name (max 85 characters).";

    if (Object.keys(inputsErrors).length > 0) {
      setValidationErrors(inputsErrors);
      return;
    }

    const isAnyFieldModified = Object.keys(fields).some(
      (field) => fields[field]?.trim() !== (user[field] || "")?.trim()
    );
    const isCoverModified = !!cover;
    const isProfileModified = !!profile;

    if (!isAnyFieldModified && !isCoverModified && !isProfileModified) {
      toast.info("No changes detected.");
      return;
    }

    const newCity =
      fields.city?.trim().length > 0 ? fields.city.trim() : "Undefined";

    const updatedFields = {
      firstName: fields.firstName.trim(),
      lastName: fields.lastName.trim(),
      city: newCity,
    };

    updateMutation.mutate({
      updatedFields,
      coverFile: cover,
      profileFile: profile,
    });
  };

  return (
    <div className="update">
      <div className="wrapper">
        <h1>Update Your Profile</h1>

        <form onSubmit={handleSubmit}>
          <div className="files">
            {/* Cover */}
            <div className="cover">
              <span>Cover Picture</span>
              <div className="img-container">
                <LazyLoadImage
                  src={
                    coverUrl
                      ? coverUrl
                      : user.coverPic
                      ? `/uploads/${user.coverPic}`
                      : defaultCover
                  }
                  className="cover"
                  alt="cover"
                />
                <label htmlFor="selected-cover">
                  <CloudUploadIcon className="icon" />
                </label>
              </div>
              <input
                type="file"
                id="selected-cover"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUpdating}
              />
            </div>

            {/* Profile */}
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
                  className="profile-pic"
                  alt="profile"
                />
                <label htmlFor="selected-profile">
                  <CloudUploadIcon className="icon" />
                </label>
              </div>
              <input
                type="file"
                id="selected-profile"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* Fields */}
          <label htmlFor="firstName">First name</label>
          <input
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

          <button type="submit" disabled={isUpdating}>
            {isUpdating ? (
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
  );
}
