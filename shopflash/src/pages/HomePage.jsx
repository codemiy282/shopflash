import React, { useState, useContext } from "react";
import TopBar from "../components/TopBar";
import MainHeader from "../components/MainHeader";
import HeroSection from "../components/HeroSection";
import PromoAppSection from "../components/PromoAppSection";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import VoucherList from "../components/VoucherList";
import { CartContext } from "../components/CartContext";
import { productWithVariantsAPI, promotionAPI } from "../services/api";
import { useFetch } from "../hooks/useAPI";

function HomePage() {
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const { addToCart } = useContext(CartContext);

  // Fetch products with variants from backend
  const { data: products = [], loading, error } = useFetch(
    () => productWithVariantsAPI.getAll(0, 50),
    []
  );

  // Fetch promotions from backend
  const { data: promotions = [] } = useFetch(
    () => promotionAPI.getActive(),
    []
  );

  // Ensure products is always an array
  const productList = Array.isArray(products) ? products : [];

  // Use backend products
  const flashSaleProducts = productList.slice(0, 4);
  const recommendedProducts = productList.slice(4, 8).length > 0 ? productList.slice(4, 8) : productList.slice(0, 4);
  
  // Map promotions to voucher format for VoucherList component
  const vouchers = Array.isArray(promotions) ? promotions.map(p => ({
    id: p.promotion_id,
    code: `PROMO${p.promotion_id}`,
    description: p.description,
    discountAmount: p.discount_value,
    type: p.discount_type === 'percentage' ? 'PERCENT' : (p.discount_type === 'free_shipping' ? 'FREESHIP' : 'CASH'),
    expiresAt: p.end_date
  })) : [];

  const topLinks = [
    { label: "Tải app", href: "#" },
    { label: "Trợ giúp", href: "#" },
    { label: "Đăng nhập / Đăng ký", href: "/login" }
  ];

  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="page-home">
      <TopBar
        text="🔥 Miễn phí vận chuyển cho đơn từ 149.000đ • Flash sale 0h - 2h mỗi ngày"
        links={topLinks}
      />
      <MainHeader />
      <HeroSection />
      <PromoAppSection />

      {error && (
        <div style={{ padding: "20px", backgroundColor: "#fff3cd", color: "#856404", margin: "20px", borderRadius: "4px" }}>
          <strong>⚠️ API Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          Loading products...
        </div>
      )}

      {/* Phần Flash Sale -- Hiển thị danh sách sản phẩm sale */}
      <section className="section flash-sale-section">
        <div className="container section-header-row">
          <div className="section-header">
            <h2>⚡ Flash Sale đang diễn ra</h2>
            <span className="section-subtitle">
              Giá chỉ từ 9.000đ, số lượng có hạn
            </span>
          </div>
          <a href="/category?type=flash-sale" className="btn-link">
            Xem tất cả &raquo;
          </a>
        </div>
        <div className="container">
          <ProductGrid
            products={flashSaleProducts}
            onAddToCart={addToCart} // Pass lên cho ProductCard
          />
        </div>
      </section>

      {/* Phần Gợi ý sản phẩm cho người dùng */}
      <section className="section">
        <div className="container section-header-row">
          <div className="section-header">
            <h2>⭐ Gợi ý cho bạn</h2>
            <span className="section-subtitle">
              Dựa trên xu hướng mua sắm trên ShopFlash
            </span>
          </div>
          <a href="/category" className="btn-link">
            Xem thêm &raquo;
          </a>
        </div>
        <div className="container">
          <ProductGrid
            products={recommendedProducts}
            onAddToCart={addToCart}
          />
        </div>
      </section>

      <Footer />

      {/* Modal hiển thị danh sách voucher */}
      <Modal isOpen={showVoucherModal} onClose={() => setShowVoucherModal(false)}>
        <div className="modal-badge modal-badge--secondary">
          🎫 Voucher của bạn
        </div>
        <h2 className="modal-title">Lưu tất cả voucher hot hôm nay</h2>
        <p className="modal-text">
          Áp dụng cho các ngành hàng phổ biến: điện tử, gia dụng, thời trang, siêu thị…
        </p>
        <VoucherList vouchers={vouchers} onCopy={handleCopyVoucher} />
        <button
          className="btn btn-primary btn-full"
          type="button"
          onClick={() => setShowVoucherModal(false)}
        >
          Xong, quay lại mua sắm
        </button>
      </Modal>
    </div>
  );
}

export default HomePage;
