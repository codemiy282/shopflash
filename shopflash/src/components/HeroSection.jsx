import React from "react";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container hero-inner">
        <div className="hero-main">
          <div className="hero-badge">⚡ Super Flash Sale</div>
          <h1>
            Giảm giá sốc đến <span>80%</span>
          </h1>
          <p>
            Hàng ngàn deal xịn, freeship toàn quốc, đổi trả 7 ngày. Săn nhanh kẻo lỡ!
          </p>
          <div className="hero-cta">
            <a href="/category?type=flash-sale" className="btn btn-accent">
              Săn Flash Sale ngay
            </a>
            <a href="/category" className="btn btn-ghost">
              Xem tất cả danh mục
            </a>
          </div>
          <div className="hero-countdown">
            <span>Kết thúc trong:</span>
            <div className="timer" id="flash-timer">
              <div className="timer-block">
                <span className="timer-value" id="hours">00</span>
                <span className="timer-label">Giờ</span>
              </div>
              <div className="timer-separator">:</div>
              <div className="timer-block">
                <span className="timer-value" id="minutes">00</span>
                <span className="timer-label">Phút</span>
              </div>
              <div className="timer-separator">:</div>
              <div className="timer-block">
                <span className="timer-value" id="seconds">00</span>
                <span className="timer-label">Giây</span>
              </div>
            </div>
          </div>
        </div>
        <aside className="hero-side">
          <div className="side-card side-card--voucher">
            <h3>🎫 Voucher hôm nay</h3>
            <ul>
              <li><span className="tag">Giảm 30k</span> đơn từ 199k</li>
              <li><span className="tag">Giảm 80k</span> đơn từ 499k</li>
              <li><span className="tag">Freeship</span> toàn quốc</li>
            </ul>
            <button className="btn btn-outline" id="btn-open-voucher-modal">Lưu tất cả</button>
          </div>
          <div className="side-card side-card--support">
            <h3>📦 Đảm bảo từ ShopFlash</h3>
            <ul>
              <li>Hàng chính hãng 100%</li>
              <li>7 ngày đổi trả dễ dàng</li>
              <li>Thanh toán khi nhận hàng (COD)</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default HeroSection;
