import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.scss";

// Icons
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircle";
import ErrorRoundedIcon from "@mui/icons-material/Error";

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [error, setError] = useState(false); //TODO - Uncomment later

  const error = true; //TODO - Delete later

  const handleLogin = () => {
    login();
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Welcome to Jessbook !</h1>
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
          <h1>Login</h1>
          <form>
            {error && (
              <span className="errorMsg">Invalid email or password.</span>
            )}

            <div className="inputGroup">
              <input
                type="email"
                placeholder="Email"
                maxLength={64}
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error ? (
                <ErrorRoundedIcon
                  className="icon"
                  sx={{ fontSize: "30px", color: "#f75252" }}
                />
              ) : (
                <CheckCircleRoundedIcon
                  className="icon"
                  sx={{ fontSize: "30px", color: "#00e676" }}
                />
              )}
            </div>

            <div className="inputGroup">
              <input
                type="password"
                id="password"
                placeholder="Password"
                maxLength={64}
                autoComplete="off"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error ? (
                <ErrorRoundedIcon
                  className="icon"
                  sx={{ fontSize: "30px", color: "#f75252" }}
                />
              ) : (
                <CheckCircleRoundedIcon
                  className="icon"
                  sx={{ fontSize: "30px", color: "#00e676" }}
                />
              )}
            </div>

            <button onClick={handleLogin}>Sign in</button>

            <span>Forgot your password ?</span>
          </form>
        </div>
      </div>
    </div>
  );
}
