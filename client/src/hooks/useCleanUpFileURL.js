//************************* useCleanUpFileURL.js ****************************
// Hook to create a Blob URL for preview and automatically clean it up
//***************************************************************************

import { useState, useEffect } from "react";

/**
 * Creates a Blob URL for a given File/Blob object and revokes it on cleanup
 * @param {File | null} file - The File object (from input[type="file"]) to create a URL for.
 * @returns {string | null} - The temporary object URL string, or null
 */

// Clean up URL fileName to prevent memory leaks
export const useCleanUpFileURL = (file) => {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (file) {
      // 1. Create the new URL
      const newUrl = URL.createObjectURL(file);
      setObjectUrl(newUrl);

      return () => {
        // 2. Revoke the previous URL when the file changes or component unmounts
        URL.revokeObjectURL(newUrl);
      };
    } else {
      // If file becomes null, clear the state
      setObjectUrl(null);
    }
    // Dependency includes 'file', so cleanup runs correctly when a new file is selected
  }, [file]);

  return objectUrl; // Returns the Blob URL string for use in <img> or <video> src
};
