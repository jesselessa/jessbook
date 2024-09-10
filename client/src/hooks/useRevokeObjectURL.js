import { useEffect } from "react";

export const useRevokeObjectURL = (file) => {
  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(file);
    };
  }, [file]);
};
