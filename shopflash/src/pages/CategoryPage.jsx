import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { productWithVariantsAPI, categoryAPI } from "../services/api";
import { useFetch } from "../hooks/useAPI";

// Format price for display as VND
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

// Get category ID from URL query string
function getCategoryIdFromQuery(location) {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.get("id") || "";
}

function CategoryPage() {
  const location = useLocation();
  const categoryIdFromUrl = getCategoryIdFromQuery(location);

  // State for categories and selected category
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryIdFromUrl);

  // Fetch categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryAPI.getAll();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  // Update selected category when URL changes
  useEffect(() => {
    setSelectedCategory(categoryIdFromUrl);
  }, [categoryIdFromUrl]);

  // Fetch products with variants from backend
  const { data: productsData = [], loading } = useFetch(
    () => productWithVariantsAPI.getAll(0, 100),
    []
  );

  // Filters and UI inputs
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [stock, setStock] = useState({ OK: true, LOW: true, OUT: false });
  const [promoOnly, setPromoOnly] = useState(false);

  // Map API products to component format
  const products = Array.isArray(productsData) ? productsData.map(p => {
    const mappedVariants = p.variants?.length > 0 
      ? p.variants.map(v => ({
          variantId: v.variant_id,
          color: v.color || "Default",
          size: v.size,
          listPrice: parseFloat(v.list_price) || 0,
          discountPrice: parseFloat(v.discount_price) || parseFloat(v.list_price) || 0,
          availableQty: v.available_qty || 0,
          stockStatus: v.available_qty > 10 ? "OK" : (v.available_qty > 0 ? "LOW" : "OUT")
        }))
      : [{ variantId: 0, color: "Default", size: null, listPrice: 100000, discountPrice: 100000, availableQty: 100, stockStatus: "OK" }];
    
    return {
      productId: p.product_id,
      name: p.name,
      sku: p.sku,
      categoryId: p.category_id,
      brand: p.brand_name || "Unknown",
      rating: 4.5,
      sold: Math.floor(Math.random() * 500) + 10,
      displayStatus: "ACTIVE",
      variants: mappedVariants,
      thumbnail: p.thumbnail ? `http://localhost:8000${p.thumbnail}` : `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(p.name?.substring(0, 20) || 'Product')}`
    };
  }) : [];

  // Filter products by category and user-selected filters
  let filtered = products.filter(product => {
    const variant = product.variants?.[0];
    if (!variant) return false;
    
    const price = variant.discountPrice || 0;
    const variantStock = variant.stockStatus || "OK";

    // Filter by category
    if (selectedCategory && product.categoryId !== parseInt(selectedCategory)) return false;
    // Filter by price range
    if (minPrice && price < Number(minPrice)) return false;
    if (maxPrice && price > Number(maxPrice)) return false;
    // Filter by stock
    if (!stock[variantStock]) return false;
    // Filter by promotion
    if (promoOnly && variant.discountPrice >= variant.listPrice) return false;
    // Filter by search
    if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Sort products
  if (sort === "price-asc") filtered.sort((a, b) => a.variants[0].discountPrice - b.variants[0].discountPrice);
  if (sort === "price-desc") filtered.sort((a, b) => b.variants[0].discountPrice - a.variants[0].discountPrice);
  if (sort === "rating-desc") filtered.sort((a, b) => b.rating - a.rating);

  // Get current category name
  const currentCategoryName = selectedCategory 
    ? categories.find(c => c.category_id === parseInt(selectedCategory))?.name || "Danh mục"
    : "Tất cả";

  // Page UI
  return (
    <div className="page-category">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span>🛍️ Sản phẩm / {currentCategoryName}</span>
          <div className="top-bar-links">
            <Link to="/">Trang chủ</Link>
            <Link to="/cart">Giỏ hàng</Link>
          </div>
        </div>
      </div>
      <Header />
      <main className="container category-main">
        {/* Sidebar Filters */}
        <aside className="category-filter">
          <h3>Bộ lọc</h3>
          
          {/* Category Filter */}
          <div className="filter-group">
            <span className="filter-label">Danh mục</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Khoảng giá</span>
            <div className="filter-row">
              <input
                type="number"
                placeholder="Từ"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Đến"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Tình trạng kho</span>
            {["OK", "LOW", "OUT"].map(key => (
              <label key={key} style={{ display: "block", marginBottom: "4px" }}>
                <input
                  type="checkbox"
                  checked={stock[key]}
                  onChange={e => setStock(s => ({ ...s, [key]: e.target.checked }))}
                />
                {" " + (key === "OK" ? "Còn nhiều" : key === "LOW" ? "Sắp hết" : "Hết hàng")}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Khuyến mãi</span>
            <label>
              <input
                type="checkbox"
                checked={promoOnly}
                onChange={e => setPromoOnly(e.target.checked)}
              />
              {" Đang khuyến mãi"}
            </label>
          </div>
        </aside>
        {/* Product List */}
        <section className="category-products">
          <div className="category-header-row" style={{marginBottom: "16px"}}>
            <h1 className="category-title">
              {selectedCategory 
                ? `Danh mục: ${currentCategoryName}`
                : "Tất cả sản phẩm"}
            </h1>
            <input
              type="text"
              className="select"
              placeholder="Tìm trong danh mục..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginRight: 8 }}
            />
            <select
              id="sort-select"
              value={sort}
              className="select"
              onChange={e => setSort(e.target.value)}
            >
              <option value="popular">Phổ biến</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="rating-desc">Đánh giá cao</option>
            </select>
          </div>
          <div style={{ marginBottom: "16px", color: "#666" }}>
            Hiển thị {filtered.length} sản phẩm
          </div>
          {loading && (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              Loading products...
            </div>
          )}
          <div className="product-grid" id="category-grid">
            {filtered.length ? (
              filtered.map(item => {
                const v = item.variants[0];
                return (
                  <article className="product-card" key={item.productId}>
                    <div className="product-image">
                      <img src={item.thumbnail} alt={item.name} />
                    </div>
                    <h3 className="product-title">{item.name}</h3>
                    <div className="product-price-row">
                      <span className="price-current">{formatPrice(v.discountPrice)}</span>
                      {v.discountPrice < v.listPrice && (
                        <span className="price-old">{formatPrice(v.listPrice)}</span>
                      )}
                    </div>
                    <div className="product-meta">
                      <span>⭐ {item.rating}</span>
                      <span>{item.sold} đã bán</span>
                    </div>
                    <Link className="btn btn-primary btn-full" to={`/product/${item.productId}`}>
                      Xem chi tiết
                    </Link>
                  </article>
                );
              })
            ) : (
              <p>Không tìm thấy sản phẩm phù hợp.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default CategoryPage;
