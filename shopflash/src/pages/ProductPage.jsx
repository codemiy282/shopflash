import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";
import { productAPI, reviewAPI, wishlistAPI, productImageAPI } from "../services/api";
import { useFetch } from "../hooks/useAPI";
import { CartContext } from "../components/CartContext";
import { AuthContext } from "../components/AuthContext";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch product details from backend
  const { data: product, loading, error } = useFetch(
    () => productAPI.getById(id),
    [id]
  );

  // Fetch product images from backend
  const { data: imagesData } = useFetch(
    () => productImageAPI.getByProduct(id),
    [id]
  );
  const images = Array.isArray(imagesData) ? imagesData : [];

  // Fetch reviews from backend
  const { data: reviewsData } = useFetch(
    () => reviewAPI.getByProduct(id),
    [id]
  );
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  if (loading) {
    return (
      <div className="page-product">
        <TopBar text="Chi tiết sản phẩm" links={[{ label: "Trang chủ", href: "/" }]} />
        <MainHeader />
        <main className="container product-main">
          <p>Đang tải sản phẩm...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-product">
        <TopBar text="Chi tiết sản phẩm" links={[{ label: "Trang chủ", href: "/" }]} />
        <MainHeader />
        <main className="container product-main">
          <p>{error || "Không tìm thấy sản phẩm."}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const variant = product.variants?.[0] || {};
  
  // Map variant fields from snake_case to camelCase
  const availableQty = parseInt(variant.available_qty) || 0;
  const mappedVariant = {
    variantId: variant.variant_id || 0,
    color: variant.color || "Default",
    size: variant.size || null,
    listPrice: parseFloat(variant.list_price) || 0,
    discountPrice: parseFloat(variant.discount_price) || parseFloat(variant.list_price) || 0,
    availableQty: availableQty,
    stockStatus: availableQty > 10 ? "OK" : (availableQty > 0 ? "LOW" : "OUT")
  };

  const discountPercent = mappedVariant.listPrice && mappedVariant.discountPrice
    ? Math.round((1 - mappedVariant.discountPrice / mappedVariant.listPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart({
      productId: product.product_id,
      name: product.name,
      thumbnail: product.thumbnail || '/default-product.png',
      rating: product.rating || 4.5,
      sold: product.sold || 0,
    }, {
      ...mappedVariant,
      name: mappedVariant.color // CartContext expects variant.name
    });
    alert("Đã thêm vào giỏ hàng!");
  };

  const handleAddToWishlist = async () => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      alert("Vui lòng đăng nhập để thêm vào yêu thích!");
      navigate("/login");
      return;
    }

    if (!mappedVariant.variantId || !product.product_id) {
      alert("Không thể thêm vào yêu thích: Sản phẩm không có phiên bản hợp lệ");
      return;
    }

    setAddingToWishlist(true);
    try {
      await wishlistAPI.add(mappedVariant.variantId, product.product_id);
      alert("Đã thêm vào danh sách yêu thích!");
    } catch (error) {
      console.error("Wishlist add error:", error);
      // If authentication error, redirect to login
      if (error.message.includes("Not authenticated") || error.message.includes("401")) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        navigate("/login");
      } else {
        alert(`Lỗi: ${error.message}`);
      }
    } finally {
      setAddingToWishlist(false);
    }
  };

  return (
    <div className="page-product">
      {/* Thanh điều hướng trên cùng trang chi tiết sản phẩm */}
      <TopBar
        text="Chi tiết sản phẩm"
        links={[
          { label: "Trang chủ", href: "/" },
          { label: "Quay lại danh mục", href: "/category" },
        ]}
      />
      <MainHeader />
      <main className="container product-main">
        <section className="product-detail">
          {/* Bên trái: ảnh sản phẩm */}
          <div className="product-detail-left">
            <div className="product-detail-image">
              <img 
                src={images.length > 0 ? `http://localhost:8000${images[selectedImageIndex].url}` : product.thumbnail} 
                alt={product.name} 
              />
            </div>
            {/* Image thumbnails */}
            {images.length > 1 && (
              <div className="product-image-thumbnails" style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px',
                overflowX: 'auto',
                padding: '4px'
              }}>
                {images.map((img, idx) => (
                  <img
                    key={img.image_id}
                    src={`http://localhost:8000${img.url}`}
                    alt={`${product.name} ${idx + 1}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: selectedImageIndex === idx ? '2px solid #007bff' : '2px solid transparent',
                      borderRadius: '4px',
                      transition: 'border 0.2s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Bên phải: thông tin, giá, chọn variant, action */}
          <div className="product-detail-right">
            <h1>{product.name}</h1>
            <div className="product-detail-meta">
              <span>Thương hiệu: <strong>{product.brand}</strong></span>
              <span>Đánh giá: ⭐ {product.rating}</span>
              <span>Đã bán: {product.sold}</span>
            </div>
            {/* Hiển thị giá sau khuyến mãi & phần trăm giảm */}
            <div className="product-detail-price">
              <div className="price-main">
                <span className="price-current">
                  {formatPrice(mappedVariant.discountPrice)}
                </span>
                <span className="price-old">
                  {formatPrice(mappedVariant.listPrice)}
                </span>
                {discountPercent > 0 && (
                  <span className="badge-sale">
                    -{discountPercent}%
                  </span>
                )}
              </div>
              <div className="price-note">
                Giá đã bao gồm VAT, chưa gồm phí vận chuyển.
              </div>
            </div>
            {/* Variant: màu sắc, kích cỡ, trạng thái kho */}
            <div className="product-detail-variant">
              <div className="variant-row">
                <span className="variant-label">Màu sắc:</span>
                <span className="variant-chip">
                  {mappedVariant.color || "Mặc định"}
                </span>
              </div>
              {mappedVariant.size && (
                <div className="variant-row">
                  <span className="variant-label">Kích cỡ:</span>
                  <span className="variant-chip">{mappedVariant.size}</span>
                </div>
              )}
              <div className="variant-row">
                <span className="variant-label">Tình trạng kho:</span>
                <span className={`variant-status variant-${mappedVariant.stockStatus.toLowerCase()}`}>
                  {mappedVariant.stockStatus === "OK" ? "Còn hàng" : mappedVariant.stockStatus === "LOW" ? "Sắp hết" : "Hết hàng"}
                </span>
              </div>
            </div>
            {/* Các nút thao tác: mua ngay, thêm giỏ, yêu thích */}
            <div className="product-detail-actions">
              <button className="btn btn-accent" id="btn-buy-now">Mua ngay</button>
              <button className="btn btn-primary" id="btn-add-cart" onClick={handleAddToCart}>
                Thêm vào giỏ
              </button>
              <button 
                className="btn btn-ghost" 
                id="btn-wishlist" 
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
              >
                {addingToWishlist ? "⏳ Đang thêm..." : "❤️ Yêu thích"}
              </button>
            </div>
          </div>
        </section>

        {/* Product Description Section */}
        {product.description && (
          <section className="product-description" style={{ 
            marginTop: "40px", 
            padding: "24px", 
            backgroundColor: "#fff", 
            borderRadius: "8px",
            border: "1px solid #e0e0e0"
          }}>
            <h2 style={{ marginBottom: "16px", fontSize: "24px", fontWeight: 600 }}>Mô tả sản phẩm</h2>
            <div style={{ lineHeight: "1.8", color: "#444" }}>
              {product.description}
            </div>
          </section>
        )}

        {/* Product Reviews Section */}
        <section className="product-reviews" style={{ 
          marginTop: "40px", 
          padding: "24px", 
          backgroundColor: "#fff", 
          borderRadius: "8px",
          border: "1px solid #e0e0e0"
        }}>
          <h2 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: 600 }}>
            Đánh giá sản phẩm ({Array.isArray(reviews) ? reviews.length : 0})
          </h2>
          
          {Array.isArray(reviews) && reviews.length > 0 ? (
            <div style={{ display: "grid", gap: "16px" }}>
              {reviews.map((review, index) => (
                <div 
                  key={review.review_id || index}
                  style={{
                    padding: "16px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9"
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    marginBottom: "8px" 
                  }}>
                    <div style={{ fontWeight: 600, fontSize: "16px" }}>
                      {review.user_id || "Người dùng"}
                    </div>
                    <div style={{ color: "#ff9800", fontSize: "14px" }}>
                      {"⭐".repeat(review.rating || 5)}
                    </div>
                  </div>
                  {review.comment && (
                    <p style={{ margin: "8px 0", color: "#444", lineHeight: "1.6" }}>
                      {review.comment}
                    </p>
                  )}
                  {review.created_at && (
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                      {new Date(review.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666", padding: "20px", textAlign: "center" }}>
              Chưa có đánh giá nào cho sản phẩm này
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default ProductPage;
