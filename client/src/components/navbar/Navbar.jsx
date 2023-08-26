import { useContext, useState } from "react";
import "./navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../../utils/axios.jsx";

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

// Contexts
import { DarkModeContext } from "../../contexts/darkModeContext.jsx";
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Navbar() {
  const { darkMode, toggleTheme } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);

  const [burgerClicked, setBurgerClicked] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    makeRequest.post("/auth/logout");
    navigate("/login");
  };

  const toggleMenu = () => {
    setBurgerClicked(!burgerClicked);
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
          <span className="logoMob">j</span>
        </Link>
        {/* Main icons */}
        <Link to="/">
          <HomeOutlinedIcon sx={{ fontSize: "30px" }} />
        </Link>
        {darkMode ? (
          <WbSunnyOutlinedIcon
            fontSize="large"
            onClick={toggleTheme}
            className="themeBtn"
          />
        ) : (
          <DarkModeOutlinedIcon
            className="themeBtn"
            fontSize="large"
            onClick={toggleTheme}
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
          <img
            src={
              currentUser.profilePic ||
              "https://images.pexels.com/photos/1586981/pexels-photo-1586981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            }
            // src={`/uploads/$currentUser.profilePic`}
            alt="profile"
          />
        </Link>
        <span onClick={handleLogout}>Logout</span>
      </div>

      {/* Burger menu */}
      <div className="rightMob">
        <Link to={`/profile/${currentUser.id}`}>
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
          <div className="burgerList">
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
