import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { wishlistAPI } from "../services/api";
import { AuthContext } from "../components/AuthContext";

// Optionally format price the same way everywhere:
function formatPrice(price) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load wishlist items if authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await wishlistAPI.getAll();
      setWishlistItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (variantId, productId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm khỏi danh sách yêu thích?")) {
      return;
    }
    
    try {
      await wishlistAPI.remove(variantId, productId);
      await loadWishlist(); // Reload the wishlist
    } catch (err) {
      alert(`Lỗi khi xóa sản phẩm: ${err.message}`);
    }
  };

  // Map API wishlist items to component format - keep both IDs for deletion
  const products = wishlistItems.map(item => ({
    productId: item.product_id,
    variantId: item.variant_id,
    name: item.product_name,
    rating: 4.5,
    sold: 0,
    color: item.color,
    size: item.size,
    listPrice: parseFloat(item.list_price) || 0,
    discountPrice: parseFloat(item.discount_price) || parseFloat(item.list_price) || 0,
    thumbnail: item.thumbnail ? `http://localhost:8000${item.thumbnail}` : `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(item.product_name?.substring(0, 20) || 'Product')}`
  })); 

  return (
    <div className="page-wishlist">
      {/* Top bar */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span>❤️ Sản phẩm yêu thích</span>
          <div className="top-bar-links">
            <Link to="/">Trang chủ</Link>
            <Link to="/cart">Giỏ hàng</Link>
          </div>
        </div>
      </div>

      {/* Main wishlist section */}
      <main className="container">
        <section className="section">
          <div className="section-header">
            <h1>Danh sách yêu thích</h1>
            <span className="section-subtitle">
              Ánh xạ bảng WISHLIST + WISHLIST_VARIANT
            </span>
          </div>
          {loading && (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              Đang tải danh sách yêu thích...
            </div>
          )}
          {error && (
            <div style={{ padding: "20px", backgroundColor: "#fff3cd", color: "#856404", margin: "20px", borderRadius: "4px" }}>
              <strong>⚠️ Lỗi:</strong> {error}
            </div>
          )}
          <div className="product-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <div className="product-card" key={product.variantId}>
                  <div className="product-image">
                    <img src={product.thumbnail} alt={product.name} />
                  </div>
                  <h3 className="product-title">{product.name}</h3>
                  <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                    {product.color && <span>Màu: {product.color}</span>}
                    {product.size && <span> • Size: {product.size}</span>}
                  </div>
                  <div className="product-price-row">
                    <span className="price-current">
                      {formatPrice(product.discountPrice)}
                    </span>
                    {product.discountPrice < product.listPrice && (
                      <span className="price-old">
                        {formatPrice(product.listPrice)}
                      </span>
                    )}
                  </div>
                  <div className="product-actions" style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <Link className="btn btn-primary btn-sm" to={`/product/${product.productId}`}>
                      Xem chi tiết
                    </Link>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      onClick={() => handleRemove(product.variantId, product.productId)}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))
            ) : !loading && (
              <p>Hiện chưa có sản phẩm yêu thích.</p>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Wishlist;
