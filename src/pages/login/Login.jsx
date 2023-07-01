import "./login.scss";

export default function Login() {
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
          <button>Register</button>
        </div>

        <div className="right">
          <h1>Login</h1>
          <form>
            <input type="text" placeholder="Username" required />
            <input type="password" placeholder="Password" required />
            <button>Sign in</button>
            <span>
              <a href="#" target="_blank">
                Forgot password ?
              </a>
            </span>
          </form>
        </div>
      </div>
    </div>
  );
}
