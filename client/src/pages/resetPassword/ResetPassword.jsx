import { useState, useEffect } from "react";
import "./resetPassword.scss";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../../utils/axios.js";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [inputsValues, setInputsValues] = useState({
    password: "",
    confirmPswd: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Check window object width for responsive design
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
    return () => {
      window.removeEventListener("resize", changeWindowWidth);
    };
  }, [windowWidth]);

  const changeWindowWidth = () => setWindowWidth(window.innerWidth);

  const clearForm = () =>
    setInputsValues({
      password: "",
      confirmPswd: "",
    });

  // Handle inputs changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputsValues((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await makeRequest.post(`/auth/reset-password`, inputsValues);
      toast.success("Your password has been successfully reset.");

      clearForm();

      setTimeout(() => {
        navigate("/"); // Redirect to login page
      }, 3000);
    } catch (error) {
      setError(error.response?.data.message || error.message);

      // Reset form and clear API error message after 5 seconds
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="resetPassword">
      {/* Logo - Back to Login page */}
      <Link to="/">
        <span className="logo">{windowWidth <= 425 ? "j" : "jessbook"}</span>
      </Link>

      <div className="wrapper">
        <h1>Reset your password</h1>

        <form name="reset-password-form" onSubmit={handleSubmit}>
          <label htmlFor="password">Enter a new password :</label>
          <input
            type="password"
            id="password"
            name="password"
            value={inputsValues.password}
            autoComplete="off"
            onChange={handleChange}
          />

          <label htmlFor="confirmPswd">Confirm password :</label>
          <input
            type="password"
            id="confirmPswd"
            name="confirmPswd"
            value={inputsValues.confirmPswd}
            autoComplete="off"
            onChange={handleChange}
          />

          {error && <span className="api-msg">{error}</span>}
          <button type="submit">Change password</button>
        </form>

        <Link to="/">
          <span className="login-btn">Go back to Login page</span>
        </Link>
      </div>
    </div>
  );
}
