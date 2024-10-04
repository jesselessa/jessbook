import { useState, useEffect } from "react";
import "./forgotPassword.scss";
import { Link } from "react-router-dom";
import { makeRequest } from "../../utils/axios.js";
import { toast } from "react-toastify";

export default function RecoverAccount() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Check window object width for responsive design
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
  }, [windowWidth]);

  const changeWindowWidth = () => setWindowWidth(window.innerWidth);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call API to find account and send email
      await makeRequest.post("/auth/recover-account", { email });
      setEmail(""); // Reset form
      setErrorMsg(""); // Clear any previous error
      toast.success("A reset link has been sent to your email.");
    } catch (error) {
      if (error.response?.status === 404) {
        setErrorMsg("There is no account associated with this email.");
      } else {
        setErrorMsg("An unknown error has occurred. Please, try again later.");
      }
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
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit">Send a reset link</button>
        </form>

        {errorMsg && <span className="error-msg">{errorMsg}</span>}

        <Link to="/login">
          <span>Go back to Login page</span>
        </Link>
      </div>
    </div>
  );
}
