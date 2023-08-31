import { useContext, useState } from "react";
import "./update.scss";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../utils/axios.jsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Icon
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Contexts
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Update({ setOpenUpdate, user }) {
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fields, setFields] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    // email: user.email,
    // password: user.password,
    country: user.country,
  });

  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const upload = async (file) => {
    console.log("File:", file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/uploads", formData);
      console.log("Res.data:", res.data);
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFields((prev) => ({ ...prev, [e.target.name]: [e.target.value] }));
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
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();

    let coverUrl;
    let profileUrl;
    coverUrl = cover ? await upload(cover) : user.coverPic;
    profileUrl = profile ? await upload(profile) : user.profilePic;

    mutation.mutate({ ...fields, coverPic: coverUrl, profilePic: profileUrl });

    // Update localStorage with new user data
    const updatedUser = {
      ...user,
      ...fields,
      coverPic: coverUrl,
      profilePic: profileUrl,
    };
    setCurrentUser(updatedUser);

    setOpenUpdate(false);
    setCover(null);
    setProfile(null);

    toast.success("Profile updated.");
    navigate(`/profile/${currentUser.id}`);
  };

  return (
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
          {/* <label>Email</label>
          <input
            type="text"
            value={fields.email}
            name="email"
            onChange={handleChange}
          /> */}
          {/* <label>Password</label>
          <input
            type="text"
            value={fields.password}
            name="password"
            onChange={handleChange}
          /> */}
          <label>First name</label>
          <input
            type="text"
            value={fields.firstName}
            name="firstName"
            onChange={handleChange}
          />
          <label>Last name</label>
          <input
            type="text"
            value={fields.lastName}
            name="lastName"
            onChange={handleChange}
          />
          <label>City</label>
          <input
            type="text"
            name="country"
            value={fields.country}
            onChange={handleChange}
          />
          <button onClick={handleClick}>Update</button>
        </form>
        <button className="close" onClick={() => setOpenUpdate(false)}>
          Close
        </button>
      </div>
    </div>
  );
}
