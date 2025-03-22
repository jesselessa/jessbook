import { useState, useEffect } from "react";
import "./termsOfUse.scss";
import { Link } from "react-router-dom";

export default function TermsOfUse() {
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
    <div className="termsOfUse">
      {/* Logo - Back to Login page */}
      <Link to="/">
        <span className="logo">{windowWidth <= 425 ? "j" : "jessbook"}</span>
      </Link>

      <h1>Terms Of Use</h1>
    </div>
  );
}
