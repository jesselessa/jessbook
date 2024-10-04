import { useState, useEffect } from "react";
import "./resetPassword.scss";
import { Link, useParams, useNavigate } from "react-router-dom";
import { makeRequest } from "../../utils/axios.js";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [inputsValues, setInputsValues] = useState({
    password: "",
    confirmPswd: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    password: "",
    confirmPswd: "",
  });

  const { token } = useParams(); // Get token from URL
  console.log("Token reçu : ", token); // Ajoutez ce log pour vérifier le token

  const navigate = useNavigate();

  // Check window object width for responsive design
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
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
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1 - Handle form validation
    let inputsErrors = {};

    // Password with regex validation
    if (
      !/(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}/.test(
        inputsValues.password
      )
    )
      inputsErrors.password =
        "Password must contain at least 6 characters including at least 1 number and 1 symbol.";

    // Confirmation password
    if (inputsValues.password?.trim() !== inputsValues.confirmPswd?.trim())
      inputsErrors.confirmPswd = "Password does not match.";

    // If errors during validation, update state and stop process
    if (Object.keys(inputsErrors).length > 0) {
      setValidationErrors(inputsErrors);
      return;
    }

    // Clear error messages
    setValidationErrors({ password: "", confirmPswd: "" });

    // 2 - If successful validation, call API to reset password
    try {
      await makeRequest.post(`/auth/reset-password/${token}`, {
        password: inputsValues.password,
      });

      clearForm();
      toast.success("Your password has been successfully sent.");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error("Password reset failed.");
    }
  };

  return (
    <div className="resetPassword">
      {/* Logo */}
      <Link to="/login">
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
            onChange={handleChange}
          />
          {validationErrors.password && (
            <span className="error-msg">{validationErrors.password}</span>
          )}

          <label htmlFor="confirmPswd">Confirm password :</label>
          <input
            type="password"
            id="confirmPswd"
            name="confirmPswd"
            value={inputsValues.confirmPswd}
            onChange={handleChange}
          />
          {validationErrors.confirmPswd && (
            <span className="error-msg">{validationErrors.confirmPswd}</span>
          )}

          <button type="submit">Change password</button>
        </form>

        <Link to="/login">
          <span className="login-btn">Go back to Login page</span>
        </Link>
      </div>
    </div>
  );
}
