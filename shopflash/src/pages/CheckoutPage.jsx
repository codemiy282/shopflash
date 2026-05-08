import React, { useState, useContext } from "react";
import TopBar from "../components/TopBar";
import MainHeader from "../components/MainHeader";
import ShippingOptions from "../components/ShippingOptions";
import PaymentOptions from "../components/PaymentOptions";
import CartSummary from "../components/CartSummary";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { orderAPI, addressAPI, authAPI, shippingAPI, paymentAPI } from "../services/api";
import { useFetch } from "../hooks/useAPI";
import { CartContext } from "../components/CartContext";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

// Default fallback data in case API fails
const fallbackShipping = [
  { partner_id: 1, name: "Standard Shipping", service_types: ["Standard"], fee: 5 },
  { partner_id: 2, name: "Express Shipping", service_types: ["Express"], fee: 10 }
];

const fallbackPaymentMethods = [
  { method_id: 1, name: "Cash on Delivery (COD)" },
  { method_id: 2, name: "E-Wallet" }
];

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useContext(CartContext);
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(1);
  const [error, setError] = useState("");

  // Fetch shipping options from backend
  const { data: shippingData = [] } = useFetch(
    () => shippingAPI.getAll(),
    []
  );

  // Fetch payment methods from backend
  const { data: paymentData = [] } = useFetch(
    () => paymentAPI.getAll(),
    []
  );

  // Use API data or fallback - prices in USD
  const shippingOptions = (shippingData && shippingData.length > 0) 
    ? shippingData.map(s => ({
        partner: s.name,
        serviceType: s.service_types?.[0] || "Standard",
        fee: 5 + (s.partner_id * 5), // Calculate fee based on partner (USD)
        eta: "2-5 days"
      }))
    : fallbackShipping.map(s => ({
        partner: s.name,
        serviceType: s.service_types?.[0] || "Standard",
        fee: s.fee,
        eta: "2-5 days"
      }));

  const paymentMethods = (paymentData && paymentData.length > 0)
    ? paymentData.map(p => ({
        id: p.method_id,
        name: p.name
      }))
    : fallbackPaymentMethods.map(p => ({
        id: p.method_id,
        name: p.name
      }));

  // Set default payment if available
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPayment) {
      setSelectedPayment(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPayment]);

  // Use cart items or show empty state
  const cart = cartItems || [];
  
  // Demo cart if empty
  const demoCart = cart.length > 0 ? cart : [
    {
      id: "demo",
      name: "Sample Product",
      variant: "Default",
      price: 10,
      listPrice: 15,
      qty: 1,
      quantity: 1,
    }
  ];

  const subtotal = demoCart.reduce(
    (sum, item) => sum + (item.quantity || item.qty || 1) * (item.price || 0),
    0
  );
  const itemSummary = demoCart.map(item => ({
    name: item.name || item.product?.name,
    variant: item.variant || "Default",
    qty: item.quantity || item.qty || 1,
    price: item.price || 0,
    total: (item.quantity || item.qty || 1) * (item.price || 0)
  }));

  const shippingFee = shippingOptions[selectedShipping]?.fee || 5;
  const taxPercent = 10; // 10% tax
  const tax = Math.round(subtotal * taxPercent / 100);
  const total = subtotal + shippingFee + tax;

  const topLinks = [
    { label: "Quay lại giỏ hàng", href: "/cart" }
  ];

  // Handle checkout - create order via API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Check if user is authenticated
      if (!authAPI.isAuthenticated()) {
        alert("⚠️ Vui lòng đăng nhập trước khi thanh toán!");
        navigate("/login");
        return;
      }

      // Create default address if needed (simplified)
      let addressId = 1; // Fallback
      try {
        const addresses = await addressAPI.getAll();
        if (addresses.length > 0) {
          addressId = addresses[0].address_id;
        }
      } catch (err) {
        console.warn("Could not fetch addresses:", err);
      }

      // Create order via API
      const orderData = {
        address_id: addressId,
        fullname: "Customer",
        phone_number: "0123456789",
        total_amount: demoCart.length,
        total_money: total,
        tax: tax,
      };

      const order = await orderAPI.create(orderData);
      
      // Clear cart after successful order
      clearCart();
      
      // Navigate to thank you page
      navigate("/thankyou", { state: { orderId: order.order_id } });
    } catch (err) {
      setError(err.message || "❌ Lỗi khi tạo đơn hàng!");
      alert(err.message || "❌ Lỗi khi tạo đơn hàng!");
    }
  };

  return (
    <div className="page-checkout">
      <TopBar text="💳 Thanh toán đơn hàng" links={topLinks} />
      <MainHeader />

      <main className="container checkout-main">
        <form className="checkout-column" onSubmit={handleSubmit}>
          {/* Địa chỉ nhận hàng mẫu */}
          <h2>Địa chỉ giao hàng (Demo)</h2>
          <div className="card">
            <strong>Nguyễn Văn A</strong> <br />
            123 Đường ABC, Quận 1, TP. HCM <br />
            SĐT: 0987 654 321
          </div>

          {/* Chọn phương thức vận chuyển */}
          <h2>Vận chuyển</h2>
          <ShippingOptions
            options={shippingOptions}
            selectedIndex={selectedShipping}
            onChange={setSelectedShipping}
          />

          {/* Chọn phương thức thanh toán */}
          <h2>Thanh toán</h2>
          <PaymentOptions
            methods={paymentMethods}
            selectedId={selectedPayment}
            onChange={setSelectedPayment}
          />

          {/* Hiển thị sản phẩm trong đơn hàng */}
          <h2>Sản phẩm trong đơn</h2>
          <ul>
            {itemSummary.map((item, idx) => (
              <li key={idx}>
                {item.name} ({item.variant}) - x{item.qty} = {formatPrice(item.total)}
              </li>
            ))}
          </ul>
        </form>
        {/* Phần tóm tắt hóa đơn cuối trang */}
        <CartSummary
          subtotal={subtotal}
          shippingFee={shippingFee}
          taxPercent={taxPercent}
          onCheckout={handleSubmit}
        />
        <div className="checkout-total" style={{marginTop:"20px"}}>
          <strong>Tổng cộng: {formatPrice(total)}</strong>
        </div>
        {error && <div style={{color: "red", marginTop: "10px"}}>⚠️ {error}</div>}
      </main>

      <Footer />
    </div>
  );
}

export default CheckoutPage;
