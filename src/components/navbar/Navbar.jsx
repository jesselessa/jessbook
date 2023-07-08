import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.scss";

// Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
// import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";

// Contexts
import { DarkModeContext } from "../../contexts/darkModeContext.jsx";
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Navbar() {
  const { darkMode, toggle } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // TODO - Replace below function by data fetched from API
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="navbar" role="navigation">
      <div className="left">
        {/* Logo */}
        <Link to="/">
          <span>jessbook</span>
        </Link>
        {/* Main icons */}
        <Link to="/">
          <HomeOutlinedIcon sx={{ fontSize: "30px" }} />
        </Link>
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

        {/* Search bar */}
        <div className="searchBar">
          <SearchOutlinedIcon sx={{ fontSize: "30px" }} />
          <input type="search" placeholder="Search..." />
        </div>
      </div>

      <div className="right">
        {/* Other icons */}
        {/* <Link to={`/profile/${currentUser.id}`}>
          <PersonOutlinedIcon fontSize="large" />
        </Link> */}
        <Link to="#">
          <GridViewOutlinedIcon fontSize="large" />
        </Link>
        <Link to="#">
          <EmailOutlinedIcon fontSize="large" />
        </Link>
        <Link to="#">
          <NotificationsOutlinedIcon fontSize="large" />
        </Link>

        <Link to={`/profile/${currentUser.id}`}>
          <img src={currentUser.profilePic} alt="profile" />
        </Link>
        <span onClick={handleLogout}>Logout</span>
      </div>
    </div>
  );
}
