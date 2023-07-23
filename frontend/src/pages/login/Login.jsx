import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.scss";
import { toast } from "react-toastify";

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Login() {
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const [inputsValues, setInputsValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  //* Check window object width when loading page (for responsive)
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
  }, [windowWidth]);

  const changeWindowWidth = () => {
    setWindowWidth(window.innerWidth);
  };

  //* Handle inputs
  const handleChange = (e) => {
    setInputsValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  //* Clear form
  const clearForm = () => {
    setInputsValues({
      email: "",
      password: "",
    });
  };

  //* Login function
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(inputsValues);

      toast.success("Successful login !");

      clearForm();

      navigate("/");
    } catch (error) {
      console.log(error);
      setError(error.response.data);
      toast.error("Access denied. Log in first.");
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
            <h1 className="titleMob">Welcome&nbsp;to Jessbook</h1>
          ) : (
            <h1>Login</h1>
          )}

          <form onSubmit={handleSubmit}>
            {error && <span className="errorMsg">{error}</span>}

            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              required
              value={inputsValues.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              autoComplete="off"
              required
              value={inputsValues.password}
              onChange={handleChange}
            />

            <button type="submit">Sign in</button>

            {/* <span>Forgot your password ?</span> */}

            {windowWidth <= 1150 && (
              <Link to="/register">
                <button className="registerBtn">Register</button>
              </Link>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
