/**
 * API Service - Centralized backend API communication
 * All frontend requests go through this service
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Get auth headers
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token
    ? { 'Authorization': `Bearer ${token}` }
    : {};
};

/**
 * Make API request with error handling
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log("API Request:", { url, method: options.method || "GET" });
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    console.log("API Response Status:", response.status);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data = null;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data?.detail || data?.message || `HTTP ${response.status}`);
    }

    console.log(`API Success [${endpoint}]:`, data);
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// ==================== AUTHENTICATION ====================

export const authAPI = {
  register: async (userData) => {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('userId', response.user_id);
    }
    
    return response;
  },

  login: async (username, password) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // Store token
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('userId', response.user_id);
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  },

  getCurrentUserId: () => {
    return localStorage.getItem('userId');
  },

  // Get current user info from server
  getMe: async () => {
    return apiRequest('/api/auth/me');
  },

  // Update current user info
  updateMe: async (userData) => {
    return apiRequest('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  },
};

// ==================== PRODUCTS ====================

export const productAPI = {
  getAll: async (skip = 0, limit = 10) => {
    return apiRequest(`/api/products?skip=${skip}&limit=${limit}`);
  },

  getById: async (productId) => {
    return apiRequest(`/api/products/${productId}`);
  },

  getCategories: async () => {
    return apiRequest('/api/categories');
  },

  getBrands: async () => {
    return apiRequest('/api/brands');
  },
};

// ==================== ORDERS ====================

export const orderAPI = {
  getAll: async () => {
    return apiRequest('/api/orders');
  },

  getById: async (orderId) => {
    return apiRequest(`/api/orders/${orderId}`);
  },

  create: async (orderData) => {
    return apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getItems: async (orderId) => {
    return apiRequest(`/api/orders/${orderId}/items`);
  },
};

// ==================== ADDRESSES ====================

export const addressAPI = {
  getAll: async () => {
    return apiRequest('/api/addresses');
  },

  getById: async (addressId) => {
    return apiRequest(`/api/addresses/${addressId}`);
  },

  create: async (addressData) => {
    return apiRequest('/api/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  update: async (addressId, addressData) => {
    return apiRequest(`/api/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  delete: async (addressId) => {
    return apiRequest(`/api/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== REVIEWS ====================

export const reviewAPI = {
  getByProduct: async (productId) => {
    return apiRequest(`/api/products/${productId}/reviews`);
  },

  create: async (productId, reviewData) => {
    return apiRequest(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },
};

// ==================== SHIPPING ====================

export const shippingAPI = {
  getAll: async () => {
    return apiRequest('/api/shipping');
  },

  getById: async (partnerId) => {
    return apiRequest(`/api/shipping/${partnerId}`);
  },
};

// ==================== PAYMENT METHODS ====================

export const paymentAPI = {
  getAll: async () => {
    return apiRequest('/api/payment-methods');
  },

  getById: async (methodId) => {
    return apiRequest(`/api/payment-methods/${methodId}`);
  },
};

// ==================== PROMOTIONS ====================

export const promotionAPI = {
  getActive: async () => {
    return apiRequest('/api/promotions');
  },

  getAll: async () => {
    return apiRequest('/api/promotions/all');
  },

  getById: async (promotionId) => {
    return apiRequest(`/api/promotions/${promotionId}`);
  },
};

// ==================== COUNTRIES ====================

export const countryAPI = {
  getAll: async () => {
    return apiRequest('/api/countries');
  },
};

// ==================== CATEGORIES ====================

export const categoryAPI = {
  getAll: async () => {
    return apiRequest('/api/categories');
  },
  getById: async (id) => {
    return apiRequest(`/api/categories/${id}`);
  },
};

// ==================== PRODUCTS WITH VARIANTS ====================

export const productWithVariantsAPI = {
  getAll: async (skip = 0, limit = 50) => {
    return apiRequest(`/api/products/with-variants?skip=${skip}&limit=${limit}`);
  },
};

// ==================== WISHLIST ====================

export const wishlistAPI = {
  getAll: async () => {
    return apiRequest('/api/wishlist');
  },

  add: async (variantId, productId) => {
    return apiRequest(`/api/wishlist/add?variant_id=${variantId}&product_id=${productId}`, {
      method: 'POST',
    });
  },

  remove: async (variantId, productId) => {
    return apiRequest(`/api/wishlist/${variantId}?product_id=${productId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PRODUCT IMAGES ====================

export const productImageAPI = {
  getByProduct: async (productId) => {
    return apiRequest(`/api/products/${productId}/images`);
  },
};

// ==================== HEALTH CHECK ====================

export const systemAPI = {
  health: async () => {
    return apiRequest('/health');
  },

  root: async () => {
    return apiRequest('/');
  },
};

const apiServices = {
  authAPI,
  productAPI,
  productWithVariantsAPI,
  productImageAPI,
  categoryAPI,
  orderAPI,
  addressAPI,
  reviewAPI,
  wishlistAPI,
  shippingAPI,
  paymentAPI,
  promotionAPI,
  countryAPI,
  systemAPI,
};

export default apiServices;
