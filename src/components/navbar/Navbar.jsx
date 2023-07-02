import { Link } from "react-router-dom";
import "./navbar.scss";
// Images
import user from "../../assets/images/profile/john_doe.jpg";
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
  return (
    <div className="navbar" role="navigation">
      <div className="left">
        {/* Logo */}
        <Link to="/">
          <span>jessbook</span>
        </Link>

        {/* Main icons */}
        <HomeOutlinedIcon fontSize="large" />
        <DarkModeOutlinedIcon fontSize="large" />
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
          <div>
            <img src={user} alt="profile" />
          </div>
          <span>John Doe</span>
        </div>
      </div>
    </div>
  );
}
