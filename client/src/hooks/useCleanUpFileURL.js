import { useEffect } from "react";

// Clean up URL fileName to prevent memory leaks
export const useCleanUpFileURL = (fileName) => {
  useEffect(() => {
    return () => {
      if (fileName) URL.revokeObjectURL(fileName);
    };
  }, [fileName]);
};
