import React from "react";

function MainHeader() {
  return (
    <header className="main-header">
      <div className="container header-inner">
        <a href="/" className="logo">
          <span className="logo-mark">S</span>
          <span className="logo-text">ShopFlash</span>
        </a>
        <div className="search-box">
          <input type="text" placeholder="Tìm sản phẩm, thương hiệu, danh mục..." />
          <button className="btn btn-primary">Tìm kiếm</button>
        </div>
        <div className="header-actions">
          <a href="/wishlist" className="icon-btn">
            <span className="icon">❤️</span>
            <span className="icon-label">Yêu thích</span>
          </a>
          <a href="/cart" className="icon-btn">
            <span className="icon">🛒</span>
            <span className="icon-label">Giỏ hàng</span>
          </a>
          <a href="/profile" className="icon-btn">
            <span className="icon">👤</span>
            <span className="icon-label">Tài khoản</span>
          </a>
        </div>
      </div>
      <nav className="nav-categories">
        <div className="container nav-inner">
          <a href="/" className="nav-item active">Trang chủ</a>
          <a href="/category" className="nav-item">Sản phẩm</a>
        </div>
      </nav>
    </header>
  );
}

export default MainHeader;
