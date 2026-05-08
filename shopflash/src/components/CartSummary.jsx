import React from "react";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

/*
  Props:
    subtotal: number            // Tổng tạm tính (số)
    shippingFee: number         // Phí vận chuyển (số)
    taxPercent: number          // Phần trăm thuế, ví dụ 10 cho VAT 10% (số nguyên)
    onCheckout: function        // Hàm khi bấm nút Thanh toán (tùy chọn)
*/
function CartSummary({ subtotal, shippingFee, taxPercent, onCheckout }) {
  const tax = subtotal * taxPercent / 100;
  const total = subtotal + shippingFee + tax;

  return (
    <aside className="cart-summary">
      <h2>Tóm tắt đơn hàng {/* Order Summary */}</h2>
      <div className="cart-summary-row">
        <span>Tạm tính {/* Subtotal */}</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="cart-summary-row">
        <span>Thuế ({taxPercent}%) {/* Tax */}</span>
        <span>{formatPrice(tax)}</span>
      </div>
      <div className="cart-summary-row">
        <span>Phí vận chuyển {/* Shipping Fee */}</span>
        <span>{formatPrice(shippingFee)}</span>
      </div>
      <div className="cart-summary-row total">
        <span>Tổng cộng {/* Total */}</span>
        <span>{formatPrice(total)}</span>
      </div>
      {onCheckout && (
        <button
          className="btn btn-primary btn-full"
          style={{ marginTop: 10 }}
          onClick={onCheckout}
        >
          Thanh toán {/* Checkout */}
        </button>
      )}
    </aside>
  );
}

export default CartSummary;
