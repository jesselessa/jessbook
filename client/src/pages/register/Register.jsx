import { useEffect, useState } from "react";
import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function Register() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [inputsValues, setInputsValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPswd: "",
  });
  // Errors from form
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPswd: "",
  });
  // Errors from API
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Check window object width when loading page (for responsive)
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
    return () => {
      window.removeEventListener("resize", changeWindowWidth);
    };
  }, [windowWidth]);

  const changeWindowWidth = () => setWindowWidth(window.innerWidth);

  // Clear form
  const clearForm = () =>
    setInputsValues({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPswd: "",
    });

  // Clear validation errors in form
  const clearValidationErrors = () =>
    setValidationErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPswd: "",
    });

  // Handle inputs change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputsValues((prev) => ({ ...prev, [name]: value })); // Update values
    clearValidationErrors(); // Clear form errors
    setError(""); // Clear API error
  };

  // Registration feature
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1 - Handle form validation
    let inputsErrors = {};

    const { firstName, lastName, email, password, confirmPswd } = inputsValues;

    // a - Check name
    if (firstName?.trim()?.length < 2 || firstName?.trim()?.length > 35)
      inputsErrors.firstName = "Enter a name between 2 and 35\u00A0characters.";

    if (lastName?.trim()?.length < 1 || lastName?.trim()?.length > 35)
      inputsErrors.lastName = "Enter a name between 1 and 35\u00A0characters.";

    // b - Check email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email?.trim()) || email?.length > 320)
      inputsErrors.email = "Enter a valid email.";

    // c - Check password
    const passwordRegex =
      /(?=.*[0-9])(?=.*[~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%])[a-zA-Z0-9~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%]{6,}/;
    if (
      !passwordRegex.test(password?.trim()) ||
      password?.trim()?.length > 200
    ) {
      inputsErrors.password =
        "Password must be between 6 and 200\u00A0characters, including at least 1\u00A0number and 1\u00A0symbol.";
    }

    // d - Check confirmation password (trim() removes whitespace from both sides of a string)
    if (password?.trim() !== confirmPswd?.trim())
      inputsErrors.confirmPswd = "Password does not match.";

    // e - If errors during validation, update state and stop process
    if (Object.keys(inputsErrors).length > 0) {
      setValidationErrors(inputsErrors);
      return;
    }

    // 2 - If successful validation, continue process and call API
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        inputsValues
      );
      toast.success("Successful registration.");

      clearForm();

      // Navigate to Login page
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      // Handle API errors
      if (import.meta.env.DEV) {
        console.error(
          "An error occurred during the registration process:",
          error
        );
      }
      setError("An error occurred during the registration process.");

      // Clear error message after 5 seconds
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Register</h1>

          <form name="register-form" onSubmit={handleSubmit}>
            {/* First Name */}
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={inputsValues.firstName}
              autoComplete="off"
              onChange={handleChange}
            />
            {validationErrors.firstName && (
              <span className="error-msg">{validationErrors.firstName}</span>
            )}

            {/* Last Name */}
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={inputsValues.lastName}
              autoComplete="off"
              onChange={handleChange}
            />
            {validationErrors.lastName && (
              <span className="error-msg">{validationErrors.lastName}</span>
            )}

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={inputsValues.email}
              autoComplete="off"
              onChange={handleChange}
            />
            {validationErrors.email && (
              <span className="error-msg">{validationErrors.email}</span>
            )}

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={inputsValues.password}
              autoComplete="off"
              onChange={handleChange}
            />
            {validationErrors.password && (
              <span className="error-msg">{validationErrors.password}</span>
            )}

            {/* Confirm Password */}
            <input
              type="password"
              name="confirmPswd"
              placeholder="Confirm password"
              value={inputsValues.confirmPswd}
              autoComplete="off"
              onChange={handleChange}
            />
            {validationErrors.confirmPswd && (
              <span className="error-msg">{validationErrors.confirmPswd}</span>
            )}

            {/* API Error */}
            {error && <span className="error-msg api">{error}</span>}

            {/* Submit button */}
            <button type="submit">Sign up</button>

            {windowWidth <= 1150 && (
              <p className="login-msg">
                Have an account ?{" "}
                <Link to="/">
                  <span>Login</span>
                </Link>
              </p>
            )}
          </form>
        </div>

        <div className="right">
          <h1>Join us !</h1>

          <div className="container">
            <p>
              Jessbook is a social media app that helps you stay connected with
              your family and friends.
            </p>
            <span>Have an account ?</span>{" "}
            <Link to="/">
              <button>Login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
