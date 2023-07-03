import { useContext } from "react";
import { DarkModeContext } from "../../context/darkModeContext.jsx";

import { Link } from "react-router-dom";
import "./navbar.scss";
// Images
import user from "../../assets/images/users/john_doe.jpg";
// Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";

export default function Navbar() {
  const { toggle, darkMode } = useContext(DarkModeContext);

  return (
    <div className="navbar" role="navigation">
      <div className="left">
        {/* Logo */}
        <Link to="/">
          <span>jessbook</span>
        </Link>
        {/* Main icons */}
        <Link className="iconLink" to="/">
          <HomeOutlinedIcon sx={{ fontSize: "30px" }} />
        </Link>
        {darkMode ? (
          <WbSunnyOutlinedIcon fontSize="large" onClick={toggle} />
        ) : (
          <DarkModeOutlinedIcon fontSize="large" onClick={toggle} />
        )}
        <GridViewOutlinedIcon fontSize="large" />
        {/* Search bar */}
        <div className="searchBar">
          <SearchOutlinedIcon sx={{ fontSize: "30px" }} />
          <input type="search" placeholder="Search..." />
        </div>
      </div>

      <div className="right">
        {/* Other icons */}
        <PersonOutlinedIcon fontSize="large" />
        <EmailOutlinedIcon fontSize="large" />
        <NotificationsOutlinedIcon fontSize="large" />

        {/* User */}
        <div className="user">
          <Link to="/profile/:id">
            <img src={user} alt="profile" />
          </Link>
          <span>John Doe</span>
        </div>
      </div>
    </div>
  );
}
