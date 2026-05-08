import React from "react";

/*
  Props:
    activeSection: giá trị section đang hiển thị trong profile (string hoặc số)
    onSectionChange: hàm callback để chuyển section/profile page
*/
function ProfileNav({ activeSection, onSectionChange }) {
  return (
    <aside className="profile-nav">
      <h2>Tài khoản</h2>
      <ul>
        <li className={activeSection === "info" ? "active" : ""}>
          <a href="#" onClick={() => onSectionChange("info")}>Thông tin cá nhân</a>
        </li>
        <li className={activeSection === "orders" ? "active" : ""}>
          <a href="#" onClick={() => onSectionChange("orders")}>Đơn mua</a>
        </li>
        <li className={activeSection === "addresses" ? "active" : ""}>
          <a href="#" onClick={() => onSectionChange("addresses")}>Sổ địa chỉ</a>
        </li>
        <li className={activeSection === "wishlist" ? "active" : ""}>
          <a href="#" onClick={() => onSectionChange("wishlist")}>Sản phẩm yêu thích</a>
        </li>
        <li className={activeSection === "security" ? "active" : ""}>
          <a href="#" onClick={() => onSectionChange("security")}>Cài đặt bảo mật</a>
        </li>
      </ul>
    </aside>
  );
}

export default ProfileNav;
