"""Simple FastAPI backend with modular routers"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging
import os

# Import all routers
from routes import (
    auth as auth_router,
    products as products_router,
    categories as categories_router,
    orders as orders_router,
    addresses as addresses_router,
    reviews as reviews_router,
    wishlist as wishlist_router,
    shipping,
    payments,
    promotions
)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration from environment
API_TITLE = os.getenv('API_TITLE', 'ShopFlash API')
API_VERSION = os.getenv('API_VERSION', '1.0.0')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

app = FastAPI(title=API_TITLE, version=API_VERSION)

# ==================== CORS CONFIGURATION ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# ==================== MOUNT STATIC FILES ====================
IMAGE_DIRECTORY = Path(__file__).parent / "image"
IMAGE_DIRECTORY.mkdir(exist_ok=True)
app.mount("/images", StaticFiles(directory=str(IMAGE_DIRECTORY)), name="images")

# ==================== REGISTER ROUTERS ====================
app.include_router(auth_router.router)
app.include_router(products_router.router)
app.include_router(categories_router.router)
app.include_router(orders_router.router)
app.include_router(addresses_router.router)
app.include_router(reviews_router.router)
app.include_router(wishlist_router.router)
app.include_router(shipping.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(promotions.router, prefix="/api")

# ==================== HEALTH CHECK ====================
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ShopFlash API"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to ShopFlash API",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }

# ==================== ALL ROUTES ARE IN routes/ FOLDER ====================
# /api/auth/* - Authentication (routes/auth.py)
# /api/products/* - Products & Reviews (routes/products.py, routes/reviews.py)
# /api/categories, /api/brands, /api/countries - Categories & Brands (routes/categories.py)
# /api/orders/* - Orders (routes/orders.py)
# /api/addresses/* - Addresses (routes/addresses.py)
# /api/wishlist/* - Wishlist (routes/wishlist.py)
# /api/shipping/* - Shipping (routes/shipping.py)
# /api/payments/* - Payments (routes/payments.py)
# /api/promotions/* - Promotions (routes/promotions.py)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
