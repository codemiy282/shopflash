// src/data/data.js

const ShopFlashData = {
  products: [
    {
      productId: "MSP0000000001",
      name: "Tai nghe Bluetooth gaming RGB âm trầm mạnh",
      sku: "TN-GAMING-01",
      category: "flash-sale",
      brand: "FlashSound",
      rating: 4.7,
      sold: 320,
      displayStatus: "ACTIVE",
      variants: [
        {
          variantId: 1,
          color: "Đen đỏ",
          size: null,
          listPrice: 299000,
          discountPrice: 149000,
          stockStatus: "OK"
        }
      ],
      thumbnail: "https://via.placeholder.com/300x300.png?text=Tai+nghe+gaming"
    },
    {
      productId: "MSP0000000002",
      name: "Nồi chiên không dầu 5L bản nâng cấp có kính",
      sku: "NC-5L-NEW",
      category: "giadung",
      brand: "CookPro",
      rating: 4.8,
      sold: 540,
      displayStatus: "ACTIVE",
      variants: [
        {
          variantId: 2,
          color: "Đen",
          size: null,
          listPrice: 2200000,
          discountPrice: 799000,
          stockStatus: "LOW"
        }
      ],
      thumbnail: "https://via.placeholder.com/300x300.png?text=Noi+chien+khong+dau+5L"
    },
    {
      productId: "MSP0000000003",
      name: "Áo thun oversize unisex form rộng basic",
      sku: "AT-OVERSIZE-01",
      category: "thoitrang",
      brand: "StreetWearVN",
      rating: 4.6,
      sold: 120,
      displayStatus: "ACTIVE",
      variants: [
        {
          variantId: 3,
          color: "Trắng",
          size: "L",
          listPrice: 149000,
          discountPrice: 89000,
          stockStatus: "OK"
        }
      ],
      thumbnail: "https://via.placeholder.com/300x300.png?text=Áo+thun+oversize+unisex"
    },
    {
      productId: "MSP0000000004",
      name: "Bình giữ nhiệt inox 900ml giữ nóng lạnh 24h",
      sku: "BOTTLE-900",
      category: "giadung",
      brand: "HomeLife",
      rating: 4.7,
      sold: 2300,
      displayStatus: "ACTIVE",
      variants: [
        {
          variantId: 4,
          color: "Xanh rêu",
          size: null,
          listPrice: 199000,
          discountPrice: 159000,
          stockStatus: "OK"
        }
      ],
      thumbnail: "https://via.placeholder.com/300x300.png?text=Binh+giu+nhiet+inox+900ml"
    }
  ],
  shippingOptions: [
    {
      partner: "FlashExpress",
      serviceType: "Express",
      fee: 8,
      eta: "2-3 days"
    },
    {
      partner: "VNPost",
      serviceType: "Economy",
      fee: 5,
      eta: "4-6 days"
    }
  ],
  paymentMethods: [
    {
      id: 1,
      name: "Thanh toán khi nhận hàng (COD)"
    },
    {
      id: 2,
      name: "Ví điện tử"
    },
    {
      id: 3,
      name: "Thẻ tín dụng / ghi nợ"
    }
  ],
  taxPercent: 0.1,
  promotions: [
    {
      id: 1,
      code: "FLASH30K",
      description: "Giảm 30.000đ cho đơn từ 199.000đ",
      minOrder: 199000,
      discountAmount: 30000,
      type: "CASH",
      channel: "ALL",
      expiresAt: "2025-12-31"
    },
    {
      id: 2,
      code: "FLASH80K",
      description: "Giảm 80.000đ cho đơn từ 499.000đ",
      minOrder: 499000,
      discountAmount: 80000,
      type: "CASH",
      channel: "APP_ONLY",
      expiresAt: "2025-12-31"
    },
    {
      id: 3,
      code: "FREESHIP99",
      description: "Miễn phí vận chuyển cho đơn từ 99.000đ",
      minOrder: 99000,
      discountAmount: null,
      type: "FREESHIP",
      channel: "ALL",
      expiresAt: "2025-12-31"
    }
  ]
};

export default ShopFlashData;
