import { useContext } from "react";

// Components
import Navbar from "../../components/navbar/Navbar.jsx";
import LeftBar from "../../components/leftBar/LeftBar.jsx";
import RightBar from "../../components/rightBar/RightBar.jsx";
import Timeline from "../../components/timeline/Timeline.jsx";

// Context
import { DarkModeContext } from "../../contexts/darkModeContext.jsx";

export default function Home() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={`theme-${darkMode ? "dark" : "light"}`}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <LeftBar />
        <Timeline />
        <RightBar />
      </div>
    </div>
  );
}
