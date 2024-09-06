import { useContext, useState } from "react";
import "./updateProfile.scss";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../utils/axios.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Icon
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

// Component
import Overlay from "../overlay/Overlay.jsx";

export default function UpdateProfile({ user, setOpenUpdate }) {
  const [cover, setCover] = useState("");
  const [profile, setProfile] = useState("");
  const [fields, setFields] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    city: user.city,
  });

  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  // Upload image
  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await makeRequest.post("/uploads", formData);
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (user) => {
      return makeRequest.put("/users", user);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["user"]);
        toast.success("Profile updated.");
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();

    let coverUrl;
    let profileUrl;
    coverUrl = cover ? await upload(cover) : user.coverPic;
    profileUrl = profile ? await upload(profile) : user.profilePic;

    // Check if any of the fields are modified
    const isAnyFieldModified = Object.keys(fields).some(
      (field) => fields[field] !== user[field]
    );

    // If no fields or images modified, show message
    if (!isAnyFieldModified && !cover && !profile) {
      toast.info("No changes detected.");
      return;
    }

    // Create a copy of user object with updated values
    const updatedUser = {
      ...user, // user currently displayed in component
      ...fields,
      coverPic: coverUrl,
      profilePic: profileUrl,
    };

    setCurrentUser(updatedUser);
    setCover(null);
    setProfile(null);

    mutation.mutate(updatedUser);

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
                  {cover && (
                    <img
                      src={
                        cover
                          ? URL.createObjectURL(cover)
                          : `/uploads/${user.coverPic}`
                      }
                      alt="cover"
                    />
                  )}
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
                  {profile && (
                    <img
                      src={
                        profile
                          ? URL.createObjectURL(profile)
                          : `/uploads/${user.profilePic}`
                      }
                      alt="profile"
                    />
                  )}

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
