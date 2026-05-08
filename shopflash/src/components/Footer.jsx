import React from "react";

function Footer() {
  return (
    <footer className="main-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <h4>ShopFlash</h4>
          <p>
            Nền tảng mua sắm trực tuyến với hàng triệu sản phẩm, hỗ trợ người bán Việt Nam tiếp cận khách hàng toàn quốc.
          </p>
        </div>
        <div className="footer-col">
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li><a href="#">Trung tâm trợ giúp</a></li>
            <li><a href="#">Hướng dẫn mua hàng</a></li>
            <li><a href="#">Chính sách đổi trả</a></li>
            <li><a href="#">Liên hệ hỗ trợ</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Về ShopFlash</h4>
          <ul>
            <li><a href="#">Giới thiệu</a></li>
            <li><a href="#">Tuyển dụng</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Kết nối với chúng tôi</h4>
          <div className="social-row">
            <a href="#">Facebook</a>
            <a href="#">TikTok</a>
            <a href="#">Instagram</a>
          </div>
          <p className="footer-copy">© 2025 ShopFlash Việt Nam</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
