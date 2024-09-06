import { useState, useEffect } from "react";
import "./overlay.scss";

export default function Overlay() {
  const [showOverlay, setShowOverlay] = useState(false);

  // Force portrait mode for mobile devices on component mounting
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      const isSmallScreen = window.innerWidth <= 992;

      if (isLandscape && isSmallScreen) {
        setShowOverlay(true);
      } else {
        setShowOverlay(false);
      }
    };

    handleOrientationChange(); // Initial check

    window.addEventListener("orientationchange", handleOrientationChange);

    window.addEventListener("resize", handleOrientationChange); // Handle size changes

    // Cleanup on unmounting
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  return (
    <>
      {showOverlay && (
        <div className="overlay">
          <p className="overlayMsg">
            Please, use your device in portrait mode.
          </p>
        </div>
      )}
    </>
  );
}
