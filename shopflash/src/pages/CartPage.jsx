import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { CartContext } from "../components/CartContext";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function CartPage() {
  const { cartItems, changeQuantity, removeItem } = useContext(CartContext);
  
  // Debug log
  console.log("CartPage - cartItems:", cartItems);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cartItems.reduce((sum, item) => sum + (item.listPrice - item.price) * item.quantity, 0);
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const shipping = cartItems.length > 0 ? 5 : 0; // $5 shipping
  const total = subtotal + tax + shipping;

  return (
    <div className="page-cart">
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span>🛒 Giỏ hàng ({cartItems.length} sản phẩm)</span>
          <div className="top-bar-links">
            <Link to="/">Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
      <Header />
      <main className="container cart-main">
        <section className="cart-items">
          <h1>Giỏ hàng của bạn</h1>
          {cartItems.length > 0 ? (
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Phân loại</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Giảm giá</th>
                  <th>Tạm tính</th>
                  <th>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={`${item.id}-${item.variant}`}>
                    <td className="cart-td-product">
                      <img src={item.thumbnail || 'https://via.placeholder.com/60'} alt={item.name} style={{ width: 60, borderRadius: 4 }} />
                      <span>{item.name}</span>
                    </td>
                    <td>{item.variant || "Mặc định"}</td>
                    <td>{formatPrice(item.price)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, item.variant, -1)}
                          disabled={item.quantity <= 1}
                          style={{ padding: "4px 10px", cursor: "pointer" }}
                        >-</button>
                        <span style={{ minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, item.variant, +1)}
                          style={{ padding: "4px 10px", cursor: "pointer" }}
                        >+</button>
                      </div>
                    </td>
                    <td style={{ color: "#e53935" }}>
                      {item.listPrice > item.price ? `-${formatPrice((item.listPrice - item.price) * item.quantity)}` : "-"}
                    </td>
                    <td><strong>{formatPrice(item.price * item.quantity)}</strong></td>
                    <td>
                      <button
                        onClick={() => removeItem(item.id, item.variant)}
                        style={{ 
                          background: "#dc3545", 
                          color: "#fff", 
                          border: "none", 
                          padding: "6px 12px", 
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ fontSize: 18, color: "#666", marginBottom: 20 }}>🛒 Giỏ hàng của bạn đang trống</p>
              <Link to="/category" className="btn btn-primary">
                Tiếp tục mua sắm
              </Link>
            </div>
          )}
        </section>
        
        <aside className="cart-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="cart-summary-row">
            <span>Tạm tính ({cartItems.length} sản phẩm)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="cart-summary-row" style={{ color: "#e53935" }}>
              <span>Giảm giá</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="cart-summary-row">
            <span>VAT (10%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span>{shipping > 0 ? formatPrice(shipping) : "Free"}</span>
          </div>
          <hr />
          <div className="cart-summary-row total" style={{ fontSize: 18, fontWeight: "bold" }}>
            <span>Tổng cộng</span>
            <span style={{ color: "#e53935" }}>{formatPrice(total)}</span>
          </div>
          {cartItems.length > 0 ? (
            <Link to="/checkout" className="btn btn-primary btn-full" style={{ marginTop: 20 }}>
              Tiến hành thanh toán
            </Link>
          ) : (
            <button 
              className="btn btn-primary btn-full" 
              style={{ marginTop: 20, opacity: 0.5, cursor: "not-allowed" }}
              disabled
            >
              Tiến hành thanh toán
            </button>
          )}
        </aside>
      </main>
      <Footer />
    </div>
  );
}

export default CartPage;
