import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { AuthContext } from "../components/AuthContext";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/");
    } catch (error) {
      setErrorMsg(error.message || "Sai tên đăng nhập hoặc mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => alert("Google login (demo)");
  const handleFacebookLogin = () => alert("Facebook login (demo)");

  return (
    <>
      {/* Cấu hình <head> cho SEO và font */}
      <Helmet>
        <meta charSet="UTF-8" />
        <title>ShopFlash - Đăng nhập</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Thanh top bar trên cùng trang */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span>🔑 Đăng nhập ShopFlash</span>
          <div className="top-bar-links">
            <Link to="/">Trang chủ</Link>
            <Link to="/register">Đăng ký</Link>
          </div>
        </div>
      </div>

      {/* Form đăng nhập dạng card ở giữa trang */}
      <main
        className="container profile-main login-main"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <section
          className="profile-content"
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div
            className="card login-card"
            style={{
              padding: 32,
              width: 400,
              boxSizing: "border-box",
              border: "4px solid #000", // Viền đen
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(38,42,45,0.08)",
              background: "#fff",
              margin: "0 auto",
            }}
          >
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>
              Đăng nhập
            </h3>
            {/* Form nhập thông tin đăng nhập */}
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>Tên đăng nhập</label>
              <input
                type="text"
                placeholder="Tên đăng nhập hoặc Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Hiển thị thông báo lỗi nếu đăng nhập sai */}
              {errorMsg && (
                <div style={{ color: "red", marginTop: 10 }}>
                  {errorMsg}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </div>
            </form>
            {/* Đăng nhập Google/Facebook chỉ demo */}
            <div style={{ textAlign: "center", margin: "24px 0 12px" }}>
              hoặc đăng nhập với
            </div>
            <div
              className="social-row"
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                style={{ minWidth: 44, border: "1px solid #ddd" }}
                onClick={handleGoogleLogin}
              >
                {/* Icon Google SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 48 48"
                >
                  <g>
                    <path fill="#4285F4" d="M24 9.5c3.57 0 6.4 1.44 8.37 2.74l6.18-6.19C33.59 2.72 28.89.5 24 .5 14.97.5 7.09 6.19 3.44 14.16l7.54 5.86C13.2 14.11 17.17 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.67 24.5c0-1.49-.12-2.96-.34-4.38H24v8.28h12.69c-.55 2.8-2.23 5.16-4.74 6.76l7.53 5.85C43.71 36.74 46.67 31.22 46.67 24.5z"/>
                    <path fill="#FBBC05" d="M10.98 29.52c-1.13-.73-2.2-1.62-3.08-2.66l-7.54 5.87C4.06 41.82 13.5 48.5 24 48.5c5.8 0 11.14-2.14 15.22-5.69l-7.54-5.87c-2.04 1.37-4.51 2.18-7.68 2.18C17.14 39.5 13.06 35.78 10.98 29.52z"/>
                    <path fill="#EA4335" d="M24 48.5c6.5 0 12.01-2.15 16.03-5.69l-7.54-5.87c-2.04 1.37-4.51 2.18-7.68 2.18-5.12 0-9.48-3.39-11.01-8.41l-7.54 5.87C7.09 42.81 14.97 48.5 24 48.5z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </g>
                </svg>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ minWidth: 44, border: "1px solid #ddd" }}
                onClick={handleFacebookLogin}
              >
                {/* Icon Facebook SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="28"
                  height="28"
                >
                  <path
                    fill="#3b5998"
                    d="M24 1C11.95 1 2 10.95 2 23c0 10.88 8.13 19.85 18.64 20.83V30.14h-5.6v-6.39h5.6v-4.86c0-5.57 3.38-8.62 8.34-8.62 2.42 0 4.94.46 4.94.46v5.43h-2.79c-2.74 0-3.59 1.7-3.59 3.46v4.13h6.1l-.98 6.39h-5.12v13.7C37.87 42.85 46 33.88 46 23c0-12.05-9.95-22-22-22z"
                  />
                </svg>
              </button>
            </div>
            {/* Link chuyển tới đăng ký tài khoản */}
            <div style={{ textAlign: "center", marginTop: 18 }}>
              <Link
                to="/register"
                className="btn-link"
                style={{ color: "#d42", fontWeight: 600 }}
              >
                Đăng ký tài khoản mới
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer dưới cùng */}
      <footer className="main-footer">
        <div className="container footer-grid small">
          <div className="footer-col">
            <p>© 2025 ShopFlash Việt Nam</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default LoginPage;
