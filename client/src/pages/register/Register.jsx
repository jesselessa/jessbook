import { useState, useEffect } from "react";
import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function Register() {
  const [inputsValues, setInputsValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    pswdConfirm: "",
  });
  // Errors from form
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    pswdConfirm: "",
  });
  // Errors from API
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Check window object width when loading page (for responsive)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
    return () => {
      window.removeEventListener("resize", changeWindowWidth);
    };
  }, [windowWidth]);

  const changeWindowWidth = () => {
    setWindowWidth(window.innerWidth);
  };

  // Handle inputs
  const handleChange = (e) => {
    setInputsValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Clear form
  const clearForm = () => {
    setInputsValues({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      pswdConfirm: "",
    });
  };

  // Clear validation errors in form
  const clearValidationErrors = () => {
    setValidationErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      pswdConfirm: "",
    });
  };

  // Registration feature
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1 - Handle form validation and error messages
    const inputsErrors = {};

    // Name
    if (
      inputsValues.firstName.length < 2 ||
      inputsValues.firstName.length > 35
    ) {
      inputsErrors.firstName = "Enter a name between 2 and 35 characters.";
    }
    if (inputsValues.lastName.length < 1 || inputsValues.lastName.length > 35) {
      inputsErrors.lastName = "Enter a name between 1 and 35 characters.";
    }

    // Email with regex
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputsValues.email) ||
      inputsValues.email.length > 64
    ) {
      inputsErrors.email = "Enter a valid email.";
    }

    // Password with regex
    if (
      !/(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}/.test(
        inputsValues.password
      )
    ) {
      inputsErrors.password =
        "Password must contain at least 6 characters including at least 1 number and 1 symbol.";
    }

    // Confirmation password
    if (inputsValues.password.trim() !== inputsValues.pswdConfirm.trim()) {
      // trim() removes whitespace from both sides of a string
      inputsErrors.pswdConfirm = "Password does not match.";
    }

    // If errors during validation, update state and stop process
    if (Object.keys(inputsErrors).length > 0) {
      setValidationErrors(inputsErrors);
      toast.error("Registration failed. Check your information.");

      // Clear error messages after 5 seconds
      setTimeout(() => {
        clearValidationErrors();
      }, 5000);

      return;
    }

    // 2 - If successful validation, continue process and call API
    try {
      await axios.post(`http://localhost:8000/auth/register`, inputsValues);

      // Reset form
      clearForm();

      // Navigate to Login page
      toast.success("Successful registration.");
      navigate("/login");
    } catch (error) {
      setError(error.response.data); // from Axios

      // Clear API error message after 5 seconds
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
              minLength={2}
              autoComplete="off"
              required
              value={inputsValues.firstName}
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
              minLength={1}
              autoComplete="off"
              required
              value={inputsValues.lastName}
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
              autoComplete="off"
              required
              value={inputsValues.email}
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
              autoComplete="off"
              required
              value={inputsValues.password}
              onChange={handleChange}
            />
            {validationErrors.password && (
              <span className="error-msg">{validationErrors.password}</span>
            )}

            {/* Confirm Password */}
            <input
              type="password"
              name="pswdConfirm"
              placeholder="Confirm password"
              autoComplete="off"
              required
              value={inputsValues.pswdConfirm}
              onChange={handleChange}
            />
            {validationErrors.pswdConfirm && (
              <span className="error-msg">{validationErrors.pswdConfirm}</span>
            )}

            {/* API Error */}
            {error && <span className="error-msg api">{error}</span>}

            {/* Submit button */}
            <button type="submit">Sign up</button>

            {windowWidth <= 1150 && (
              <p className="login-msg">
                Have an account ?{" "}
                <Link to="/login">
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
            <Link to="/login">
              <button>Login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
