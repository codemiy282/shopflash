import React from "react";
import { Link, useLocation } from "react-router-dom";

// Hàm Header: hiển thị logo, ô tìm kiếm, các nút và thanh chuyển mục
function Header() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <header className="main-header">
      <div className="container header-inner">
        {/* Logo ShopFlash */}
        <Link to="/" className="logo">
          <span className="logo-mark">S</span>
          <span className="logo-text">ShopFlash</span>
        </Link>
        {/* Ô tìm kiếm sản phẩm */}
        <div className="search-box">
          <input type="text" placeholder="Tìm sản phẩm, thương hiệu, danh mục..." />
          <button className="btn btn-primary">Tìm kiếm</button>
        </div>
        {/* Nhóm nút chuyển nhanh */}
        <div className="header-actions">
          <Link to="/wishlist" className="icon-btn">
            <span className="icon">❤️</span>
            <span className="icon-label">Yêu thích</span>
          </Link>
          <Link to="/cart" className="icon-btn">
            <span className="icon">🛒</span>
            <span className="icon-label">Giỏ hàng</span>
          </Link>
          <Link to="/profile" className="icon-btn">
            <span className="icon">👤</span>
            <span className="icon-label">Tài khoản</span>
          </Link>
        </div>
      </div>

      {/* Thanh nav dưới header */}
      <nav className="nav-categories">
        <div className="container nav-inner">
          <Link
            to="/"
            className={pathname === "/" ? "nav-item active" : "nav-item"}
          >Trang chủ</Link>
          <Link
            to="/category"
            className={pathname === "/category" ? "nav-item active" : "nav-item"}
          >Sản phẩm</Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
