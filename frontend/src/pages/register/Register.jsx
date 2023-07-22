import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./register.scss";

// Icons
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircle";
import ErrorRoundedIcon from "@mui/icons-material/Error";

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pswdConfirm, setPswdConfirm] = useState("");
  // const [error, setError] = useState(false); //TODO - Uncomment later
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const error = true; //TODO - Delete later

  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
  }, [windowWidth]);

  const changeWindowWidth = () => {
    setWindowWidth(window.innerWidth);
  };

  const handleForm = (e) => {
    e.prevent.Default();
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Register</h1>
          <form onSubmit={handleForm}>
            <div className="inputGroup">
              <input
                type="text"
                placeholder="First name"
                autoComplete="off"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {error ? (
                <ErrorRoundedIcon
                  className="icon"
                  sx={{
                    fontSize: "30px",
                    color: "#f75252",
                  }}
                />
              ) : (
                <CheckCircleRoundedIcon
                  className="icon"
                  sx={{
                    fontSize: "30px",
                    color: "#00e676",
                  }}
                />
              )}
            </div>
            {error && (
              <span className="errorMsg">
                Enter a name between 2 and 35&nbsp;characters.
              </span>
            )}

            <div className="inputGroup">
              <input
                type="text"
                placeholder="Last name"
                autoComplete="off"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {error ? (
                <ErrorRoundedIcon
                  className="icon"
                  sx={{
                    fontSize: "30px",
                    color: "#f75252",
                  }}
                />
              ) : (
                <CheckCircleRoundedIcon
                  className="icon"
                  sx={{
                    fontSize: "30px",
                    color: "#00e676",
                  }}
                />
              )}
            </div>
            {error && (
              <span className="errorMsg">
                Enter a name between 2 and 35&nbsp;characters.
              </span>
            )}

            <div className="inputGroup">
              <input
                type="email"
                placeholder="Email"
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error ? (
                <ErrorRoundedIcon
                  className="icon"
                  sx={{
                    fontSize: "30px",
                    color: "#f75252",
                  }}
                />
              ) : (
                <CheckCircleRoundedIcon
                  className="icon"
                  sx={{
                    fontSize: "30px",
                    color: "#00e676",
                  }}
                />
              )}
            </div>
            {error && <span className="errorMsg">Enter a valid email.</span>}

            <div className="inputGroup">
              <input
                type="password"
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
                  sx={{
                    fontSize: "30px",
                    color: "#f75252",
                  }}
                />
              ) : (
                <CheckCircleRoundedIcon
                  className="icon"
                  sx={{
                    fontSize: "30px",
                    color: "#00e676",
                  }}
                />
              )}
            </div>
            {error && (
              <span className="errorMsg">
                Your password must contain at least 6&nbsp;characters, including
                1 number and 1&nbsp;symbol.
              </span>
            )}

            <div className="inputGroup">
              <input
                type="password"
                placeholder="Confirm password"
                maxLength={64}
                autoComplete="off"
                required
                value={pswdConfirm}
                onChange={(e) => setPswdConfirm(e.target.value)}
              />
              {error ? (
                <ErrorRoundedIcon
                  className="icon"
                  sx={{
                    fontSize: "30px",
                    color: "#f75252",
                  }}
                />
              ) : (
                <CheckCircleRoundedIcon
                  className="icon"
                  sx={{
                    fontSize: "30px",
                    color: "#00e676",
                  }}
                />
              )}
            </div>
            {error && (
              <span className="errorMsg">The password does not match.</span>
            )}
            <button onClick={handleForm}>Sign up</button>
            {windowWidth <= 1150 && (
              <p className="loginMsg">
                Have an account ?{" "}
                <span onClick={() => navigate("/login")}>Login</span>
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

            <button onClick={() => navigate("/login")}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
