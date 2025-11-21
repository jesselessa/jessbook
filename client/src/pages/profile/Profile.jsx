import { useContext } from "react";

// Components
import Navbar from "../../components/navbar/Navbar.jsx";
import LeftBar from "../../components/leftBar/LeftBar.jsx";
import RightBar from "../../components/rightBar/RightBar.jsx";
import ProfileData from "../../components/profileData/ProfileData.jsx";
import Overlay from "../../components/overlay/Overlay.jsx";

// Context
import { DarkModeContext } from "../../contexts/DarkModeContext.jsx";

export default function Profile() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={`theme-${darkMode ? "dark" : "light"}`}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <LeftBar />
        <ProfileData />
        <RightBar />
      </div>
      <Overlay />
    </div>
  );
}
