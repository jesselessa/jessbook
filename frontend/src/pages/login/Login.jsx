import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.scss";
import { toast } from "react-toastify";

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [error, setError] = useState(false); //TODO - Uncomment later
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const error = true; //TODO - Delete later

  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
  }, [windowWidth]);

  const changeWindowWidth = () => {
    setWindowWidth(window.innerWidth);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    login();
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

            <button onClick={() => navigate("/register")}>Register</button>
          </div>
        </div>

        <div className="right">
          {windowWidth <= 1150 ? (
            <h1 className="titleMob">Welcome&nbsp;to Jessbook</h1>
          ) : (
            <h1>Login</h1>
          )}

          <form>
            {error && (
              <span className="errorMsg">Invalid email or password.</span>
            )}

            <input
              type="email"
              placeholder="Email"
              autoComplete="off"
              // required // TODO - Uncomment later
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              id="password"
              placeholder="Password"
              autoComplete="off"
              // required // TODO - Uncomment later
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>Sign in</button>

            <span>Forgot your password ?</span>

            {windowWidth <= 1150 && (
              <button
                className="registerBtn"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
