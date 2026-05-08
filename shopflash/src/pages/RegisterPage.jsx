import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { AuthContext } from "../components/AuthContext";

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    birthdate: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated } = useContext(AuthContext);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (formData.username.length < 3) {
      setErrorMsg("Tên đăng nhập phải có ít nhất 3 ký tự!");
      return;
    }

    if (!formData.phone_number.match(/^\d{10,15}$/)) {
      setErrorMsg("Số điện thoại không hợp lệ (10-15 chữ số)!");
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        birthdate: formData.birthdate,
      });
      navigate("/");
    } catch (error) {
      setErrorMsg(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="UTF-8" />
        <title>ShopFlash - Đăng ký tài khoản</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Top bar */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span>📝 Đăng ký tài khoản ShopFlash</span>
          <div className="top-bar-links">
            <Link to="/">Trang chủ</Link>
            <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>

      {/* Registration form */}
      <main
        className="container profile-main login-main"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          padding: "40px 20px",
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
              width: 450,
              boxSizing: "border-box",
              border: "4px solid #000",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(38,42,45,0.08)",
              background: "#fff",
              margin: "0 auto",
            }}
          >
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>
              Đăng ký tài khoản
            </h3>

            <form className="form-grid" onSubmit={handleSubmit}>
              {/* Username */}
              <label>Tên đăng nhập *</label>
              <input
                type="text"
                name="username"
                placeholder="Tên đăng nhập (ít nhất 3 ký tự)"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={50}
                autoFocus
              />

              {/* Email */}
              <label>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              {/* Phone */}
              <label>Số điện thoại *</label>
              <input
                type="tel"
                name="phone_number"
                placeholder="0901234567"
                value={formData.phone_number}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={15}
              />

              {/* Birthdate */}
              <label>Ngày sinh *</label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />

              {/* Password */}
              <label>Mật khẩu *</label>
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />

              {/* Confirm Password */}
              <label>Xác nhận mật khẩu *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              {/* Error message */}
              {errorMsg && (
                <div style={{ 
                  color: "#dc3545", 
                  marginTop: 10, 
                  padding: "10px",
                  backgroundColor: "#f8d7da",
                  borderRadius: "4px",
                  gridColumn: "1 / -1"
                }}>
                  ❌ {errorMsg}
                </div>
              )}

              {/* Submit button */}
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                marginTop: 16,
                gridColumn: "1 / -1"
              }}>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", padding: "12px" }}
                >
                  {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>
              </div>
            </form>

            {/* Terms notice */}
            <p style={{ 
              fontSize: "12px", 
              color: "#666", 
              marginTop: "16px",
              textAlign: "center" 
            }}>
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <a href="#terms" style={{ color: "#d42" }}>Điều khoản dịch vụ</a>
              {" "}và{" "}
              <a href="#privacy" style={{ color: "#d42" }}>Chính sách bảo mật</a>
            </p>

            {/* Link to login */}
            <div style={{ textAlign: "center", marginTop: 18 }}>
              <span style={{ color: "#666" }}>Đã có tài khoản? </span>
              <Link
                to="/login"
                className="btn-link"
                style={{ color: "#d42", fontWeight: 600 }}
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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

export default RegisterPage;
