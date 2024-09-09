import { useContext, useState, useEffect } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Login() {
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const [inputsValues, setInputsValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Check window object width when loading page (for responsive)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
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
      email: "",
      password: "",
    });
  };

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await login(inputsValues);

      // Reset form and error message
      setError("");
      clearForm();
      toast.success("Successful login !");

      // Go to homepage
      navigate("/");
    } catch (error) {
      // Handle errors from API
      console.error(error);
      setError(error.response?.data || "An unknown error occured.");
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Welcome to Jessbook</h1>

          <div className="container">
            <p>
              Jessbook is a social media app that helps you stay connected with
              your family and friends.
            </p>

            <span>Don't have any account ?</span>

            <Link to="/register">
              <button type="submit">Register</button>
            </Link>
          </div>
        </div>

        <div className="right">
          {windowWidth <= 1150 ? (
            <h1 className="title-mob">Welcome&nbsp;to Jessbook</h1>
          ) : (
            <h1>Login</h1>
          )}

          <form>
            {/* Handle error from API */}
            {error && <span className="errorMsg">{error}</span>}

            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              required
              value={inputsValues.email}
              onChange={handleChange}
              autoComplete="off"
            />

            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              required
              value={inputsValues.password}
              onChange={handleChange}
              autoComplete="off"
            />

            <button onClick={handleLogin}>Sign in</button>

            {/* <span>Forgot your password ?</span> */}

            {windowWidth <= 1150 && (
              <Link to="/register">
                <button type="submit" className="register-btn">
                  Register
                </button>
              </Link>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
