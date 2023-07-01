import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import "./App.css";

// Pages
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";

// Components
import Navbar from "./components/navbar/Navbar";
import LeftMenu from "./components/leftMenu/LeftMenu";
import RightMenu from "./components/rightMenu/RightMenu";

function App() {
  const Layout = () => {
    return (
      <div>
        <Navbar />
        <div style={{ display: "flex" }}>
          <LeftMenu />
          {/* Outlet will render either Home, when the URL is /home, or Profile at /profile */}
          <Outlet />
          <RightMenu />
        </div>
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/profile/:id", element: <Profile /> },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
