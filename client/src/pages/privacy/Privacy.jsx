import { useState, useEffect } from "react";
import "./privacy.scss";
import { Link } from "react-router-dom";

export default function Privacy() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Check window object width for responsive design
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
    return () => {
      window.removeEventListener("resize", changeWindowWidth);
    };
  }, [windowWidth]);

  const changeWindowWidth = () => setWindowWidth(window.innerWidth);

  return (
    <div className="privacy">
      {/* Logo - Back to Login page*/}
      <Link to="/">
        <span className="logo">{windowWidth <= 425 ? "j" : "jessbook"}</span>
      </Link>

      <h1>Privacy</h1>
    </div>
  );
}
