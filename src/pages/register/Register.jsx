import { Link } from "react-router-dom";
import "./register.scss";

export default function Register() {
  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Join us !</h1>
          <p>
            Jessbook is a social media app that helps you stay connected with
            your family and friends.
          </p>
          <span>Have an account ?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>

        <div className="right">
          <h1>Register</h1>
          <form>
            <input type="text" placeholder="First name" required />
            <input type="text" placeholder="Last name" required />
            <input type="text" placeholder="Username" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <input type="password" placeholder="Confirm password" required />
            <button>Sign up</button>
          </form>
        </div>
      </div>
    </div>
  );
}
