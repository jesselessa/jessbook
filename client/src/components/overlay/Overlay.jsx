import { useState, useEffect } from "react";
import "./overlay.scss";

const MAX_WIDTH_PORTRAIT_REQUIRED = 767; // px

export default function Overlay() {
  const [showOverlay, setShowOverlay] = useState(false);

  // Function reused for both initial check and resize listener
  const evaluateOrientation = () => {
    const isLandscape = window.innerWidth > window.innerHeight;
    const isSmallScreen = window.innerWidth <= MAX_WIDTH_PORTRAIT_REQUIRED;
    setShowOverlay(isLandscape && isSmallScreen);
  };

  useEffect(() => {
    // Initial evaluation
    evaluateOrientation();

    // Only one listener needed: resize covers rotation events on most devices
    window.addEventListener("resize", evaluateOrientation);

    return () => {
      window.removeEventListener("resize", evaluateOrientation);
    };
  }, []);

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
