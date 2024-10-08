import { useState, useEffect } from "react";
import "./forgotPassword.scss";
import { Link } from "react-router-dom";
import { makeRequest } from "../../utils/axios.js";
import { toast } from "react-toastify";

export default function RecoverAccount() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Check window object width for responsive design
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
  }, [windowWidth]);

  const changeWindowWidth = () => setWindowWidth(window.innerWidth);

  // Handle inputs changes
  const handleChange = (e) => {
    setError(""); // Reset error message everytime input changes
    setEmail(e.target.value); // Update input value
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call API to find account and send email
      await makeRequest.post("/auth/recover-account", { email });
      setEmail(""); // Reset form
      setError(""); // Clear any previous error
      toast.success("A reset link has been sent to your email.");
    } catch (error) {
      setError(error.response?.data || "An unknown error has occurred.");

      // Clear error message after 5 seconds
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="forgotPassword">
      {/* Logo */}
      <Link to="/login">
        <span className="logo">{windowWidth <= 425 ? "j" : "jessbook"}</span>
      </Link>

      <div className="wrapper">
        <h1>Forgot your password&nbsp;?</h1>

        <form name="recover-form" onSubmit={handleSubmit}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            autoComplete="off"
            onChange={handleChange}
          />

          <button type="submit">Send a reset link</button>
        </form>

        {error && <span className="error-msg">{error}</span>}

        <Link to="/login">
          <span>Go back to Login page</span>
        </Link>
      </div>
    </div>
  );
}
