import React from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// formatPrice có thể import từ file utils
function formatPrice(price) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

/*
  Props:
    product         // Đối tượng sản phẩm (object)
    variant         // Biến thể sản phẩm (object)
    showOldPrice    // Hiển thị giá gốc hay không (bool, mặc định là true)
    onAddToCart     // Hàm khi nhấn nút 'Thêm vào giỏ'
    onWishlist      // Hàm khi nhấn nút 'Yêu thích' (tùy chọn)
*/
function ProductCard({
  product,
  variant,
  showOldPrice = true,
  onAddToCart,
  onWishlist
}) {
  // Tính phần trăm giảm giá
  const discountPercent =
    variant && variant.listPrice
      ? Math.round(100 * (1 - variant.discountPrice / variant.listPrice))
      : 0;

  // Construct full image URL
  const imageUrl = product.thumbnail 
    ? (product.thumbnail.startsWith('http') ? product.thumbnail : `${API_BASE_URL}${product.thumbnail}`)
    : `${API_BASE_URL}/images/placeholder.jpg`;

  return (
    <article className="product-card" key={product.productId}>
      <div className="product-image">
        {/* Hiển thị tag giảm giá cho sản phẩm flash sale */}
        {discountPercent > 0 && (
          <span className="product-tag">-{discountPercent}%</span>
        )}
        <img src={imageUrl} alt={product.name} />
      </div>
      <h3 className="product-title">{product.name}</h3>
      <div className="product-price-row">
        <span className="price-current">
          {formatPrice(variant.discountPrice)}
        </span>
        {showOldPrice && (
          <span className="price-old">{formatPrice(variant.listPrice)}</span>
        )}
      </div>
      <div className="product-meta">
        <span>⭐ {product.rating}</span>
        <span>
          {product.sold > 1000
            ? `Đã bán ${(product.sold / 1000).toFixed(1)}k`
            : `Đã bán ${product.sold}`}
        </span>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <a
          href={`/product/${product.productId}`}
          className="btn btn-ghost btn-sm"
        >
          Xem chi tiết
        </a>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onAddToCart(product, variant)} // Sửa đúng thành onClick
        >
          Thêm vào giỏ
        </button>
        {onWishlist && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onWishlist(product)}
          >
            ❤️ Yêu thích
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
