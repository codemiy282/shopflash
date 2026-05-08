import React from "react";
import TopBar from "../components/TopBar";
import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";

function ThankYouPage() {
  const topLinks = [
    { label: "Về trang chủ", href: "/" },
    { label: "Xem đơn hàng", href: "/profile?section=orders" }
  ];

  return (
    <div className="page-thankyou">
      <TopBar text="🎉 Đặt hàng thành công" links={topLinks} />
      <MainHeader />
      <main className="container thankyou-main">
        <div className="card thankyou-card">
          <h1>Cảm ơn bạn đã mua sắm tại ShopFlash!</h1>
          <p>Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất.</p>
          <a href="/" className="btn btn-primary" style={{marginTop: 16}}>Tiếp tục mua sắm</a>
          <a href="/profile?section=orders" className="btn btn-ghost" style={{marginTop: 8}}>Xem đơn hàng của tôi</a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ThankYouPage;
