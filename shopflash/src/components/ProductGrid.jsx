import React from "react";
import ProductCard from "./ProductCard";

function ProductGrid({ products, onAddToCart, onWishlist }) {
  // Ensure products is always an array
  const productList = Array.isArray(products) ? products : [];
  
  // Map variant from backend (snake_case) to frontend (camelCase)
  const mapVariant = (variant) => ({
    variantId: variant.variant_id,
    productId: variant.product_id,
    color: variant.color,
    size: variant.size,
    listPrice: variant.list_price,
    discountPrice: variant.discount_price,
    availableQty: variant.available_qty,
  });
  
  // Map backend product format to frontend format
  const mapProduct = (product) => {
    const variants = (product.variants || []).map(mapVariant);
    return {
      productId: product.product_id || product.productId,
      name: product.name,
      thumbnail: product.thumbnail ? `http://localhost:8000${product.thumbnail}` : '/default-product.png',
      rating: product.rating || 4.5,
      sold: product.sold || 0,
      variants: variants,
    };
  };
  
  return (
    <div className="product-grid">
      {productList.map((product) => {
        const mappedProduct = mapProduct(product);
        // Get first variant with proper fallback
        const firstVariant = mappedProduct.variants?.[0] || {
          discountPrice: 99000,
          listPrice: 199000,
          color: 'Default'
        };
        return (
          <ProductCard
            key={mappedProduct.productId}
            product={mappedProduct}
            variant={firstVariant}
            onAddToCart={onAddToCart}
            onWishlist={onWishlist}
          />
        );
      })}
    </div>
  );
}

export default ProductGrid;
