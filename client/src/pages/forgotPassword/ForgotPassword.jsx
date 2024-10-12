import { useState, useEffect } from "react";
import "./forgotPassword.scss";
import { Link } from "react-router-dom";
import { makeRequest } from "../../utils/axios.js";
import { toast } from "react-toastify";

// Component
import Loader from "../../components/loader/Loader.jsx";

export default function RecoverAccount() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loader

  // Check window object width for responsive design
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
    return () => {
      window.removeEventListener("resize", changeWindowWidth);
    };
  }, [windowWidth]);

  const changeWindowWidth = () => setWindowWidth(window.innerWidth);

  // Handle inputs changes
  const handleChange = (e) => {
    setError("");
    setEmail(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Enable loader

    try {
      // Call API to find account and send email
      await makeRequest.post("/auth/recover-account", { email });
      toast.success("A reset link has been sent to your email.");

      // Clear form and error message
      setEmail("");
      setError("");
    } catch (error) {
      setError(error.response?.data.message || error.message);

      // Clear error message after 5 seconds
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setLoading(false); // Disable loader
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
          <div className="input-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              autoComplete="off"
              style={{ width: !loading ? "100%" : "90%" }}
              onChange={handleChange}
            />

            {loading && <Loader />}
          </div>

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
