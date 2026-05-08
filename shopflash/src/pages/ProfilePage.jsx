import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { AuthContext } from "../components/AuthContext";
import { orderAPI, addressAPI, countryAPI, authAPI } from "../services/api";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, updateUser, logout } = useContext(AuthContext);
  
  // State for tab active
  const [activeTab, setActiveTab] = useState("info");
  
  // State for user form (local edit state)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    birthdate: ""
  });
  
  // State for saving
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // State for orders and addresses
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // State for address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    country_id: 1,
    unit_number: "",
    street_number: "",
    region: "",
    city: "",
    address_line: "",
    postal_code: ""
  });
  const [addressMessage, setAddressMessage] = useState({ type: "", text: "" });
  const [savingAddress, setSavingAddress] = useState(false);

  // State for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Sync form data with user data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.USERNAME || user.username || "",
        email: user.EMAIL || user.email || "",
        phone_number: user.PHONE_NUMBER || user.phone_number || "",
        birthdate: (user.BIRTHDATE || user.birthdate) ? (user.BIRTHDATE || user.birthdate).split("T")[0] : ""
      });
    }
  }, [user]);

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load orders when orders tab is active
  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated) {
      loadOrders();
    }
  }, [activeTab, isAuthenticated]);

  // Load addresses when addresses tab is active
  useEffect(() => {
    if (activeTab === "addresses" && isAuthenticated) {
      loadAddresses();
    }
  }, [activeTab, isAuthenticated]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await orderAPI.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await addressAPI.getAll();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load addresses:", error);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadCountries = async () => {
    try {
      const data = await countryAPI.getAll();
      setCountries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load countries:", error);
      setCountries([]);
    }
  };

  // Address form handlers
  const handleAddressChange = (field, value) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
    setAddressMessage({ type: "", text: "" });
  };

  const resetAddressForm = () => {
    setAddressForm({
      country_id: 1,
      unit_number: "",
      street_number: "",
      region: "",
      city: "",
      address_line: "",
      postal_code: ""
    });
    setEditingAddress(null);
    setShowAddressForm(false);
    setAddressMessage({ type: "", text: "" });
  };

  const handleAddAddress = () => {
    resetAddressForm();
    setShowAddressForm(true);
  };

  const handleEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      country_id: addr.country_id || 1,
      unit_number: addr.unit_number || "",
      street_number: addr.street_number || "",
      region: addr.region || "",
      city: addr.city || "",
      address_line: addr.address_line || "",
      postal_code: addr.postal_code || ""
    });
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    setAddressMessage({ type: "", text: "" });

    try {
      if (editingAddress) {
        await addressAPI.update(editingAddress.address_id, addressForm);
        setAddressMessage({ type: "success", text: "✅ Cập nhật địa chỉ thành công!" });
      } else {
        await addressAPI.create(addressForm);
        setAddressMessage({ type: "success", text: "✅ Thêm địa chỉ thành công!" });
      }
      await loadAddresses();
      setTimeout(() => {
        resetAddressForm();
      }, 1000);
    } catch (error) {
      setAddressMessage({ type: "error", text: `❌ Lỗi: ${error.message}` });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    
    try {
      await addressAPI.delete(addressId);
      await loadAddresses();
    } catch (error) {
      alert(`Lỗi khi xóa địa chỉ: ${error.message}`);
    }
  };

  // Handle password form field changes
  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    setPasswordMessage({ type: "", text: "" });
  };

  // Handle password form submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    // Validation
    if (!passwordForm.currentPassword) {
      setPasswordMessage({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại" });
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordMessage({ type: "error", text: "Vui lòng nhập mật khẩu mới" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Xác nhận mật khẩu không khớp" });
      return;
    }

    setSavingPassword(true);
    try {
      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordMessage({ 
        type: "error", 
        text: error.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại." 
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage({ type: "", text: "" }); // Clear message on change
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Only send fields that have changed
      const updates = {};
      if (formData.username !== user.username) updates.username = formData.username;
      if (formData.email !== user.email) updates.email = formData.email;
      if (formData.phone_number !== user.phone_number) updates.phone_number = formData.phone_number;
      
      const currentBirthdate = user.birthdate ? user.birthdate.split("T")[0] : "";
      if (formData.birthdate !== currentBirthdate) updates.birthdate = formData.birthdate;

      if (Object.keys(updates).length === 0) {
        setMessage({ type: "info", text: "Không có thay đổi nào để lưu." });
        setSaving(false);
        return;
      }

      await updateUser(updates);
      setMessage({ type: "success", text: "✅ Cập nhật thành công!" });
    } catch (error) {
      setMessage({ type: "error", text: `❌ Lỗi: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Thiết lập head và font cho trang */}
      <Helmet>
        <meta charSet="UTF-8" />
        <title>ShopFlash - Tài khoản</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Thanh top bar trên cùng */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span>👤 Tài khoản của tôi</span>
          <div className="top-bar-links">
            <Link to="/">Trang chủ</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
              Đăng xuất
            </a>
          </div>
        </div>
      </div>

      <main className="container profile-main">
        {/* Thanh điều hướng tab bên trái */}
        <aside className="profile-nav">
          <h2>Tài khoản</h2>
          <ul>
            <li className={activeTab === "info" ? "active" : ""}>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setActiveTab("info");
                }}
              >
                Thông tin cá nhân
              </a>
            </li>
            <li className={activeTab === "orders" ? "active" : ""}>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setActiveTab("orders");
                }}
              >
                Đơn mua
              </a>
            </li>
            <li className={activeTab === "addresses" ? "active" : ""}>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setActiveTab("addresses");
                }}
              >
                Sổ địa chỉ
              </a>
            </li>
            <li className={activeTab === "wishlist" ? "active" : ""}>
              <Link to="/wishlist">Sản phẩm yêu thích</Link>
            </li>
            <li className={activeTab === "security" ? "active" : ""}>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setActiveTab("security");
                }}
              >
                Cài đặt bảo mật
              </a>
            </li>
          </ul>
        </aside>

        {/* Nội dung từng tab tài khoản */}
        <section className="profile-content">
          {activeTab === "info" && (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3>Thông tin tài khoản</h3>
                <button 
                  className="btn btn-ghost"
                  onClick={() => {
                    const editMode = document.getElementById('profile-form').style.display;
                    document.getElementById('profile-form').style.display = editMode === 'none' ? 'grid' : 'none';
                    document.getElementById('profile-display').style.display = editMode === 'none' ? 'none' : 'block';
                  }}
                  type="button"
                  style={{ fontSize: "14px" }}
                >
                  ✏️ Chỉnh sửa
                </button>
              </div>

              {message.text && (
                <div style={{
                  padding: "10px",
                  marginBottom: "15px",
                  borderRadius: "4px",
                  backgroundColor: message.type === "success" ? "#d4edda" : 
                                   message.type === "error" ? "#f8d7da" : "#d1ecf1",
                  color: message.type === "success" ? "#155724" : 
                         message.type === "error" ? "#721c24" : "#0c5460"
                }}>
                  {message.text}
                </div>
              )}

              {/* Debug log - remove after testing */}
              {console.log("ProfilePage user data:", user)}
              {console.log("AuthContext loading:", authLoading, "isAuthenticated:", isAuthenticated)}

              {/* Display mode - show current user data */}
              <div id="profile-display" style={{ display: "block" }}>
                {!user && !authLoading && (
                  <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                    ⚠️ Không thể tải thông tin người dùng. Vui lòng thử đăng nhập lại.
                  </div>
                )}
                <div style={{ display: "grid", gap: "16px" }}>
                  <div>
                    <label style={{ fontWeight: 600, color: "#666", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                      Tên đăng nhập
                    </label>
                    <div style={{ padding: "8px 0", fontSize: "16px" }}>{user?.USERNAME || user?.username || "-"}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: "#666", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                      Email
                    </label>
                    <div style={{ padding: "8px 0", fontSize: "16px" }}>{user?.EMAIL || user?.email || "-"}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: "#666", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                      Số điện thoại
                    </label>
                    <div style={{ padding: "8px 0", fontSize: "16px" }}>{user?.PHONE_NUMBER || user?.phone_number || "-"}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: "#666", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                      Ngày sinh
                    </label>
                    <div style={{ padding: "8px 0", fontSize: "16px" }}>
                      {(user?.BIRTHDATE || user?.birthdate) ? new Date(user.BIRTHDATE || user.birthdate).toLocaleDateString('vi-VN') : "-"}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: "#666", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                      Trạng thái tài khoản
                    </label>
                    <div style={{ padding: "8px 0", fontSize: "16px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        backgroundColor: (user?.STATUS || user?.status) === "active" ? "#d4edda" : "#f8d7da",
                        color: (user?.STATUS || user?.status) === "active" ? "#155724" : "#721c24",
                        fontSize: "14px",
                        fontWeight: 500
                      }}>
                        {(user?.STATUS || user?.status) === "active" ? "✓ Đang hoạt động" : "✗ Không hoạt động"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: "#666", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                      Ngày tạo tài khoản
                    </label>
                    <div style={{ padding: "8px 0", fontSize: "16px" }}>
                      {(user?.CREATION_TIMESTAMP || user?.creation_timestamp) ? new Date(user.CREATION_TIMESTAMP || user.creation_timestamp).toLocaleString('vi-VN') : "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit mode - form to edit user data */}
              <form
                id="profile-form"
                className="form-grid"
                onSubmit={handleSubmit}
                style={{ display: "none" }}
              >
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={formData.username}
                  onChange={e => handleChange("username", e.target.value)}
                  required
                />
                <label>Email</label>
                <input
                  type="email"
                  placeholder="email@domain.com"
                  value={formData.email}
                  onChange={e => handleChange("email", e.target.value)}
                  required
                />
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={formData.phone_number}
                  onChange={e => handleChange("phone_number", e.target.value)}
                />
                <label>Ngày sinh</label>
                <input
                  type="date"
                  value={formData.birthdate}
                  onChange={e => handleChange("birthdate", e.target.value)}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    className="btn btn-primary" 
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button 
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => {
                      document.getElementById('profile-form').style.display = 'none';
                      document.getElementById('profile-display').style.display = 'block';
                      // Reset form data to original user data
                      setFormData({
                        username: user?.USERNAME || user?.username || "",
                        email: user?.EMAIL || user?.email || "",
                        phone_number: user?.PHONE_NUMBER || user?.phone_number || "",
                        birthdate: (user?.BIRTHDATE || user?.birthdate) ? (user.BIRTHDATE || user.birthdate).split("T")[0] : ""
                      });
                      setMessage({ type: "", text: "" });
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}
          {activeTab === "orders" && (
            <div className="card">
              <h3>Đơn mua</h3>
              {loadingOrders ? (
                <div>Đang tải đơn hàng...</div>
              ) : orders.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #ddd" }}>
                      <th style={{ padding: "10px", textAlign: "left" }}>Mã đơn</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Ngày đặt</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Tổng tiền</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.order_id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "10px" }}>#{order.order_id}</td>
                        <td style={{ padding: "10px" }}>
                          {new Date(order.created_timestamp).toLocaleDateString("vi-VN")}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total_money)}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: order.status === "completed" ? "#d4edda" : 
                                           order.status === "pending" ? "#fff3cd" : "#e2e3e5",
                            fontSize: "12px"
                          }}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>Bạn chưa có đơn hàng nào.</div>
              )}
            </div>
          )}
          {activeTab === "addresses" && (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0 }}>Sổ địa chỉ</h3>
                {!showAddressForm && (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleAddAddress}
                    style={{ padding: "8px 16px" }}
                  >
                    + Thêm địa chỉ
                  </button>
                )}
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <div style={{
                  padding: "20px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  backgroundColor: "#f9f9f9"
                }}>
                  <h4 style={{ marginTop: 0 }}>
                    {editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                  </h4>
                  {addressMessage.text && (
                    <div style={{
                      padding: "10px",
                      marginBottom: "15px",
                      borderRadius: "4px",
                      backgroundColor: addressMessage.type === "success" ? "#d4edda" : "#f8d7da",
                      color: addressMessage.type === "success" ? "#155724" : "#721c24"
                    }}>
                      {addressMessage.text}
                    </div>
                  )}
                  <form onSubmit={handleAddressSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Quốc gia</label>
                        <select
                          value={addressForm.country_id}
                          onChange={e => handleAddressChange("country_id", parseInt(e.target.value))}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                        >
                          {countries.length > 0 ? (
                            countries.map(c => (
                              <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
                            ))
                          ) : (
                            <option value={1}>Vietnam</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Tỉnh/Thành phố</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={e => handleAddressChange("city", e.target.value)}
                          placeholder="Hà Nội"
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Quận/Huyện</label>
                        <input
                          type="text"
                          value={addressForm.region}
                          onChange={e => handleAddressChange("region", e.target.value)}
                          placeholder="Cầu Giấy"
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Số nhà</label>
                        <input
                          type="text"
                          value={addressForm.street_number}
                          onChange={e => handleAddressChange("street_number", e.target.value)}
                          placeholder="123"
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Địa chỉ chi tiết</label>
                        <input
                          type="text"
                          value={addressForm.address_line}
                          onChange={e => handleAddressChange("address_line", e.target.value)}
                          placeholder="Số 123, Đường ABC, Phường XYZ"
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Số căn hộ/Tầng (nếu có)</label>
                        <input
                          type="text"
                          value={addressForm.unit_number}
                          onChange={e => handleAddressChange("unit_number", e.target.value)}
                          placeholder="Tầng 5, Căn 501"
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Mã bưu điện</label>
                        <input
                          type="text"
                          value={addressForm.postal_code}
                          onChange={e => handleAddressChange("postal_code", e.target.value)}
                          placeholder="100000"
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={savingAddress}
                      >
                        {savingAddress ? "Đang lưu..." : (editingAddress ? "Cập nhật" : "Thêm địa chỉ")}
                      </button>
                      <button 
                        type="button" 
                        className="btn"
                        onClick={resetAddressForm}
                        style={{ backgroundColor: "#6c757d", color: "white" }}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Address List */}
              {loadingAddresses ? (
                <div>Đang tải địa chỉ...</div>
              ) : addresses.length > 0 ? (
                <div>
                  {addresses.map(addr => (
                    <div key={addr.address_id} style={{
                      padding: "15px",
                      border: "1px solid #eee",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start"
                    }}>
                      <div>
                        <p style={{ margin: "0 0 5px 0" }}><strong>{addr.address_line}</strong></p>
                        <p style={{ margin: "0 0 5px 0", color: "#666" }}>
                          {addr.street_number && `Số ${addr.street_number}, `}
                          {addr.unit_number && `${addr.unit_number}, `}
                          {addr.city}, {addr.region}
                        </p>
                        <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>
                          Mã bưu điện: {addr.postal_code || "N/A"}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEditAddress(addr)}
                          style={{
                            padding: "6px 12px",
                            border: "1px solid #007bff",
                            borderRadius: "4px",
                            backgroundColor: "white",
                            color: "#007bff",
                            cursor: "pointer"
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.address_id)}
                          style={{
                            padding: "6px 12px",
                            border: "1px solid #dc3545",
                            borderRadius: "4px",
                            backgroundColor: "white",
                            color: "#dc3545",
                            cursor: "pointer"
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                  Bạn chưa có địa chỉ nào. Nhấn "+ Thêm địa chỉ" để bắt đầu.
                </div>
              )}
            </div>
          )}
          {activeTab === "security" && (
            <div className="card">
              <h3>Đổi mật khẩu</h3>
              
              {passwordMessage.text && (
                <div style={{
                  padding: "10px 15px",
                  marginBottom: "15px",
                  borderRadius: "4px",
                  backgroundColor: passwordMessage.type === "success" ? "#d4edda" : 
                                   passwordMessage.type === "error" ? "#f8d7da" : "#cce5ff",
                  color: passwordMessage.type === "success" ? "#155724" : 
                         passwordMessage.type === "error" ? "#721c24" : "#004085",
                  border: `1px solid ${passwordMessage.type === "success" ? "#c3e6cb" : 
                          passwordMessage.type === "error" ? "#f5c6cb" : "#b8daff"}`
                }}>
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: savingPassword ? "#ccc" : "#e53935",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: savingPassword ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  {savingPassword ? "Đang lưu..." : "Đổi mật khẩu"}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>

      {/* Footer cuối trang */}
      <footer className="main-footer">
        <div className="container footer-grid small">
          <div className="footer-col">
            <p>© 2025 ShopFlash Việt Nam</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default ProfilePage;
