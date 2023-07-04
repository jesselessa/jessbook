import { useContext } from "react";
import { NavLink } from "react-router-dom";
import "./navbar.scss";

// Images
// import user from "../../assets/images/users/john_doe.jpg";

// Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";

// Contexts
import { DarkModeContext } from "../../contexts/darkModeContext.jsx";
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Navbar() {
  const { darkMode, toggle } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="navbar" role="navigation">
      <div className="left">
        {/* Logo */}
        <NavLink to="/">
          <span>jessbook</span>
        </NavLink>
        {/* Main icons */}
        <NavLink to="/">
          <HomeOutlinedIcon sx={{ fontSize: "30px" }} />
        </NavLink>
        {darkMode ? (
          <WbSunnyOutlinedIcon
            className="themeBtn"
            fontSize="large"
            onClick={toggle}
          />
        ) : (
          <DarkModeOutlinedIcon
            className="themeBtn"
            fontSize="large"
            onClick={toggle}
          />
        )}
        <NavLink to="#">
          <GridViewOutlinedIcon fontSize="large" />
        </NavLink>

        {/* Search bar */}
        <div className="searchBar">
          <SearchOutlinedIcon sx={{ fontSize: "30px" }} />
          <input type="search" placeholder="Search..." />
        </div>
      </div>

      <div className="right">
        {/* Other icons */}
        <NavLink to={`/profile/${currentUser.id}`}>
          {/* <Link to="/profile/:id"> */}
          <PersonOutlinedIcon fontSize="large" />
        </NavLink>
        <NavLink to="#">
          <EmailOutlinedIcon fontSize="large" />
        </NavLink>
        <NavLink to="#">
          <NotificationsOutlinedIcon fontSize="large" />
        </NavLink>

        <NavLink to="#">
          <img src={currentUser.profilePic} alt="profile" />
          {/* <img src={user} alt="profile" /> */}
        </NavLink>
        <span>Logout</span>
      </div>
    </div>
  );
}
