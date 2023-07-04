import { useContext } from "react";
import { Link } from "react-router-dom";
import "./login.scss";

// Context
import { AuthContext } from "../../contexts/authContext";

export default function Login() {
  const { login } = useContext(AuthContext);

  const handleLogin = () => {
    login();
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Welcome to Jessbook !</h1>
          <p>
            Jessbook is a social media app that helps you stay connected with
            your family and friends.
          </p>
          <span>Don't have any account ?</span>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>

        <div className="right">
          <h1>Login</h1>
          <form>
            <input type="text" placeholder="Username" required />
            <input type="password" placeholder="Password" required />
            <button onClick={handleLogin}>Sign in</button>
            <span>Forgot your password ?</span>
          </form>
        </div>
      </div>
    </div>
  );
}
