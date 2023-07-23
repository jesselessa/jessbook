import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./register.scss";
import axios from "axios";

export default function Register() {
  const [inputsValues, setInputsValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    pswdConfirm: "",
  });
  const [error, setError] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Check window object width when loading Login page
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
  }, [windowWidth]);

  const changeWindowWidth = () => {
    setWindowWidth(window.innerWidth);
  };

  const handleChange = (e) => {
    // Match input value with its "name" attribute
    setInputsValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Email format regex
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password regex : at least 6 characters including 1 number and 1 symbol
  const isPasswordValid = (password) => {
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleClick = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password, pswdConfirm } = inputsValues;

    // Form validation
    if (firstName.length < 2 || firstName.length > 35) {
      setError(true);
    }
    if (lastName.length < 2 || lastName.length > 35) {
      setError(true);
    }
    if (!isEmailValid(email)) {
      setError(true);
    }
    if (!isPasswordValid(password) || password !== pswdConfirm) {
      setError(true);
    }

    try {
      await axios.post(`http://localhost:8000/api/auth/register`, inputsValues);
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Register</h1>
          <form>
            {/* First Name */}
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              minLength={2}
              autoComplete="off"
              required
              onChange={handleChange}
            />
            {/* Last Name */}
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              minLength={1}
              autoComplete="off"
              required
              onChange={handleChange}
            />
            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="off"
              required
              onChange={handleChange}
            />
            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="off"
              required
              onChange={handleChange}
            />
            {/* Confirm Password */}
            <input
              type="password"
              name="pswdConfirm"
              placeholder="Confirm password"
              autoComplete="off"
              required
              onChange={handleChange}
            />

            <button onClick={handleClick}>Sign up</button>
            {windowWidth <= 1150 && (
              <p className="loginMsg">
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

            <span>Have an account ?</span>

            <Link to="/login">
              <button>Login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
