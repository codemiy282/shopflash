"""Simple Pydantic models for request/response validation"""
from pydantic import BaseModel, Field, ConfigDict, field_serializer
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

# ==================== AUTH SCHEMAS ====================
class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    phone_number: str = Field(..., min_length=10, max_length=15)
    birthdate: str  # YYYY-MM-DD format

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str

# ==================== USER SCHEMAS ====================
class UserResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)
    
    user_id: str = Field(alias='USER_ID')
    username: str = Field(alias='USERNAME')
    email: str = Field(alias='EMAIL')
    phone_number: Optional[str] = Field(alias='PHONE_NUMBER')
    birthdate: Optional[str | datetime] = Field(default=None, alias='BIRTHDATE')
    status: str = Field(alias='STATUS')
    creation_timestamp: datetime | str = Field(alias='CREATION_TIMESTAMP')
    
    @field_serializer('creation_timestamp')
    def serialize_datetime(self, value, _info):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)
    
    @field_serializer('birthdate')
    def serialize_birthdate(self, value, _info):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.strftime('%Y-%m-%d')
        if hasattr(value, 'strftime'):
            return value.strftime('%Y-%m-%d')
        return str(value)

class UserUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    birthdate: Optional[str] = None  # YYYY-MM-DD format

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)

class ChangePasswordResponse(BaseModel):
    success: bool
    message: str

# ==================== PRODUCT SCHEMAS ====================
class ProductVariantResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    variant_id: int
    product_id: str
    color: Optional[str]
    size: Optional[str]
    list_price: float
    discount_price: float
    available_qty: int
    
    @field_serializer('list_price', 'discount_price')
    def serialize_decimal(self, value, _info):
        return float(value) if isinstance(value, Decimal) else value

class ProductResponse(BaseModel):
    product_id: str
    name: str
    sku: str
    description: Optional[str]
    category_id: Optional[int]
    brand_id: Optional[int]
    store_id: Optional[int]
    qty_in_stock: int

class ProductDetailResponse(ProductResponse):
    variants: List[ProductVariantResponse] = []
    thumbnail: Optional[str] = None

# ==================== CATEGORY/BRAND SCHEMAS ====================
class CategoryResponse(BaseModel):
    category_id: int
    name: str

class BrandResponse(BaseModel):
    brand_id: int
    name: str

# ==================== ORDER SCHEMAS ====================
class OrderResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    order_id: int
    user_id: str
    address_id: Optional[int]
    shipment_id: Optional[int]
    fullname: Optional[str]
    phone_number: Optional[str]
    total_amount: int
    total_money: float
    tax: float
    status: str
    created_timestamp: datetime | str
    
    @field_serializer('total_money', 'tax')
    def serialize_decimal(self, value, _info):
        return float(value) if isinstance(value, Decimal) else value
    
    @field_serializer('created_timestamp')
    def serialize_datetime(self, value, _info):
        if isinstance(value, datetime):
            return value.isoformat()
        return value

class OrderCreateRequest(BaseModel):
    address_id: Optional[int]
    fullname: str
    phone_number: str
    total_amount: int
    total_money: float
    tax: float = 0

class OrderLineItemResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    line_item_id: int
    order_id: int
    variant_id: Optional[int] = None
    product_id: Optional[str] = None
    quantity: int
    unit_price: float
    discount: float
    subtotal: float
    
    @field_serializer('unit_price', 'discount', 'subtotal')
    def serialize_decimal(self, value, _info):
        return float(value) if isinstance(value, Decimal) else value

# ==================== ADDRESS SCHEMAS ====================
class AddressCreateRequest(BaseModel):
    country_id: int
    unit_number: Optional[str]
    street_number: str
    region: str
    city: str
    address_line: str
    postal_code: str

class AddressResponse(BaseModel):
    address_id: int
    country_id: int
    user_id: str
    unit_number: Optional[str]
    street_number: str
    region: str
    city: str
    address_line: str
    postal_code: str

# ==================== REVIEW SCHEMAS ====================
class ReviewCreateRequest(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str]

class ReviewResponse(BaseModel):
    review_id: int
    order_id: int
    user_id: str
    rating: int
    comment: Optional[str]
    created_at: datetime | str
    
    @field_serializer('created_at')
    def serialize_datetime(self, value, _info):
        if isinstance(value, datetime):
            return value.isoformat()
        return value

# ==================== SHIPPING SCHEMAS ====================
class ShippingOptionResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    partner_id: int
    name: str
    rating: Optional[float]
    service_types: List[str] = []
    
    @field_serializer('rating')
    def serialize_decimal(self, value, _info):
        return float(value) if isinstance(value, Decimal) else value

# ==================== PAYMENT METHOD SCHEMAS ====================
class PaymentMethodResponse(BaseModel):
    method_id: int
    name: str

# ==================== PROMOTION SCHEMAS ====================
class PromotionResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    promotion_id: int
    description: str
    discount_type: str
    discount_value: float
    max_discount_amount: Optional[float]
    usage_limit: Optional[int]
    status: str
    start_date: datetime | str
    end_date: datetime | str
    
    @field_serializer('discount_value', 'max_discount_amount')
    def serialize_decimal(self, value, _info):
        if value is None:
            return None
        return float(value) if isinstance(value, Decimal) else value
    
    @field_serializer('start_date', 'end_date')
    def serialize_datetime(self, value, _info):
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value) if value else None

# ==================== PRODUCT WITH VARIANTS (for list) ====================
class ProductWithVariantsResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    product_id: str
    name: str
    sku: str
    description: Optional[str]
    category_id: Optional[int]
    category_name: Optional[str]
    brand_id: Optional[int]
    brand_name: Optional[str]
    store_id: Optional[int]
    qty_in_stock: int
    variants: List[ProductVariantResponse] = []

# ==================== COUNTRY SCHEMAS ====================
class CountryResponse(BaseModel):
    country_id: int
    country_name: str
