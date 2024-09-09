import { useContext } from "react";
import "./navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../../utils/axios.js";
import { useToggle } from "../../hooks/useToggle.js";

// Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

// Images
import defaultProfile from "../../assets/images/users/defaultProfile.jpg";

// Contexts
import { DarkModeContext } from "../../contexts/darkModeContext.jsx";
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Navbar() {
  const { darkMode, toggleTheme } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);

  const [burgerClicked, toggleBurgerClicked] = useToggle();

  const navigate = useNavigate();

  const navigateAndScrollTop = () => {
    navigate(`/profile/${currentUser?.id}`);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    makeRequest.post("/auth/logout");
    navigate("/login");
  };

  const toggleMenu = () => {
    toggleBurgerClicked(!burgerClicked);
  };

  return (
    <div className="navbar" role="navigation">
      <div className="left">
        {/* Logo */}
        <Link to="/">
          <span className="logo">jessbook</span>
        </Link>
        {/* Logo tablet and mobile */}
        <Link to="/">
          <span className="logo-mob">j</span>
        </Link>
        {/* Main icons */}
        <Link to="/">
          <HomeOutlinedIcon sx={{ fontSize: "30px" }} />
        </Link>
        {darkMode ? (
          <WbSunnyOutlinedIcon
            fontSize="large"
            onClick={toggleTheme}
            className="theme-btn"
          />
        ) : (
          <DarkModeOutlinedIcon
            className="theme-btn"
            fontSize="large"
            onClick={toggleTheme}
          />
        )}

        {/* Search bar */}
        <div className="searchbar">
          <SearchOutlinedIcon sx={{ fontSize: "30px" }} />
          <input type="search" placeholder="Search..." />
        </div>
      </div>

      <div className="right">
        {/* Other icons */}
        <Link to="#">
          <GridViewOutlinedIcon fontSize="large" />
        </Link>
        <Link to="#">
          <EmailOutlinedIcon fontSize="large" />
        </Link>
        <Link to="#">
          <NotificationsOutlinedIcon fontSize="large" />
        </Link>
        <img
          src={
            currentUser.profilePic
              ? `/uploads/${currentUser.profilePic}`
              : defaultProfile
          }
          onClick={navigateAndScrollTop}
          alt="profile"
        />
        <span onClick={handleLogout}>Logout</span>
      </div>

      {/* Burger menu */}
      <div className="right-mob">
        <Link to={`/profile/${currentUser?.id}`}>
          <PersonOutlinedIcon className="iconMob" fontSize="large" />
        </Link>
        <Link to="#">
          <NotificationsOutlinedIcon className="iconMob" fontSize="large" />
        </Link>
        {burgerClicked ? (
          <CloseOutlinedIcon
            className="iconMob burger"
            fontSize="large"
            onClick={toggleMenu}
          />
        ) : (
          <MenuIcon
            className="iconMob burger"
            fontSize="large"
            onClick={toggleMenu}
          />
        )}

        {/* Burger menu list*/}
        {burgerClicked && (
          <div className="burger-list">
            <Link to="#">
              <div className="item">
                <EmailOutlinedIcon fontSize="large" />
                <span>Messages</span>
              </div>
            </Link>

            <hr />

            <Link to="#">
              <div className="item">
                <GroupOutlinedIcon fontSize="large" />
                <span>Friends</span>
              </div>
            </Link>

            <hr />

            <Link to="#">
              <div className="item">
                <AddCircleOutlineOutlinedIcon fontSize="large" />
                <span>Show More</span>
              </div>
            </Link>

            <hr />

            <div className="item" onClick={handleLogout}>
              <LogoutOutlinedIcon fontSize="large" />
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
