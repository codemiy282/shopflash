import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

function TopBar({ text, links = [], showAuthLinks = true }) {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  // Filter out login/signup links if showAuthLinks is true (we'll handle them ourselves)
  const filteredLinks = links.filter(
    (link) =>
      !link.href?.includes("/login") &&
      !link.href?.includes("/register") &&
      !link.label?.toLowerCase().includes("đăng nhập") &&
      !link.label?.toLowerCase().includes("đăng ký")
  );

  return (
    <div className="top-bar">
      <div className="container top-bar-inner">
        <span>{text}</span>
        <div className="top-bar-links">
          {filteredLinks.map((link) => (
            <a href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
          
          {showAuthLinks && (
            <>
              {isAuthenticated ? (
                <>
                  <Link to="/profile">
                    👤 {user?.username || "Tài khoản"}
                  </Link>
                  <a href="#" onClick={handleLogout}>
                    Đăng xuất
                  </a>
                </>
              ) : (
                <>
                  <Link to="/login">Đăng nhập</Link>
                  <Link to="/register">Đăng ký</Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
