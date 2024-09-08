import { useState } from "react";

export const useToggle = (initialValue = false) => {
  const [isToggled, setIsToggled] = useState(initialValue);
  const toggle = () => setIsToggled((prev) => !prev);

  return [isToggled, toggle];
};
