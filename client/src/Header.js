import { Link } from "react-router-dom";
import cutu from "./images/lavender.png";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/profile`, {
      credentials: "include",
    }).then((response) => {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch(`${process.env.REACT_APP_API_URL}/logout`, {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
  }
  const username = userInfo?.username;
  return (
    <header>
      <Link to="/" className="logo">
        Lavender Letters
        <img src="https://res.cloudinary.com/diraplvly/image/upload/v1720944890/buvgz8loft3tahehmgti.jpg" alt="" width={50} height={50} />
      </Link>
      <nav>
        {username && (
          <>
            <Link to="/create" className="fpage">
              Create New Post
            </Link>
            <a onClick={logout} className="fpage">
              Logout
            </a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login" className="fpage">
              Login
            </Link>
            <Link to="/register" className="fpage">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
