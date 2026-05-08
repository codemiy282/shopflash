import React from "react";

function PromoAppSection() {
  return (
    <section className="section section-promo">
      <div className="container promo-inner">
        <div className="promo-text">
          <h2>🎉 Tải ứng dụng, nhận thêm voucher 100.000đ</h2>
          <p>
            Đăng nhập lần đầu trên app ShopFlash để nhận ngay combo voucher độc quyền,
            chỉ dành cho người dùng mới.
          </p>
          <div className="promo-actions">
            <button className="btn btn-accent">Tải app ngay</button>
            <button className="btn btn-ghost-light">Tìm hiểu thêm</button>
          </div>
        </div>
        <div className="promo-illustration">
          <div className="promo-card">-50% OFF FREESHIP</div>
        </div>
      </div>
    </section>
  );
}

export default PromoAppSection;
