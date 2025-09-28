import { useState, useEffect } from "react";
import "./overlay.scss";

// Set max-width boundary for required portrait mode
const MAX_WIDTH_PORTRAIT_REQUIRED = 600;

export default function Overlay() {
  const [showOverlay, setShowOverlay] = useState(false);

  // Checks device orientation and screen size
  useEffect(() => {
    const handleOrientationChange = () => {
      // Check if the device is currently in landscape mode
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      // Check if the screen width is within the small screen boundary (<= 600px)
      const isSmallScreen = window.innerWidth <= MAX_WIDTH_PORTRAIT_REQUIRED;

      // Show overlay if it's a small screen AND in landscape mode
      setShowOverlay(isLandscape && isSmallScreen);
    };

    handleOrientationChange(); // Initial check on component mount

    // Use "resize" and "orientationchange" to handle window resizing and device rotation
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    // Cleanup on unmounting
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  // Add a class to body in order to hide the app
  useEffect(() => {
    if (showOverlay) {
      document.body.classList.add("overlay-active");
    } else {
      document.body.classList.remove("overlay-active");
    }
  }, [showOverlay]);

  return (
    <>
      {showOverlay && (
        <div className="overlay" role="alertdialog" aria-modal="true">
          <p className="overlay-msg">
            Please, use your device in portrait mode to view the app correctly.
          </p>
        </div>
      )}
    </>
  );
}
