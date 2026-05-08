from fastapi import APIRouter, Depends, HTTPException, status
from db import execute_query
from schemas import ProductResponse, ProductDetailResponse, ProductVariantResponse, CategoryResponse, BrandResponse
import logging

router = APIRouter(prefix="/api/products", tags=["Products"])
logger = logging.getLogger(__name__)


@router.get("", response_model=list[ProductResponse])
async def get_products(skip: int = 0, limit: int = 10):
    """Get all products (basic info only)"""
    try:
        products = execute_query(
            "SELECT product_id, name, sku, description, category_id, brand_id, store_id, qty_in_stock FROM PRODUCT LIMIT %s OFFSET %s",
            (limit, skip)
        )
        return [ProductResponse(**p) for p in products]
    except Exception as e:
        logger.error(f"Get products error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get products")


@router.get("/with-variants", response_model=list[ProductDetailResponse])
async def get_products_with_variants(skip: int = 0, limit: int = 50):
    """Get all products with their variants (for frontend display)"""
    try:
        products = execute_query(
            """SELECT p.product_id, p.name, p.sku, p.description, 
                      p.category_id, c.name as category_name,
                      p.brand_id, b.name as brand_name,
                      p.store_id, p.qty_in_stock 
               FROM PRODUCT p
               LEFT JOIN CATEGORY c ON p.category_id = c.category_id
               LEFT JOIN BRAND b ON p.brand_id = b.brand_id
               LIMIT %s OFFSET %s""",
            (limit, skip)
        )
        
        if not products:
            return []
        
        product_ids = [p['product_id'] for p in products]
        placeholders = ','.join(['%s'] * len(product_ids))
        
        # Get variants
        variants = execute_query(
            f"""SELECT variant_id, product_id, color, size, list_price, discount_price, available_qty 
                FROM PRODUCT_VARIANT 
                WHERE product_id IN ({placeholders})""",
            tuple(product_ids)
        )
        
        # Get first image for each product
        images = execute_query(
            f"""SELECT pi.PRODUCT_ID, pi.NAME
                FROM PRODUCT_IMAGES pi
                INNER JOIN (
                    SELECT PRODUCT_ID, MIN(IMAGE_ID) as first_image_id
                    FROM PRODUCT_IMAGES
                    WHERE PRODUCT_ID IN ({placeholders})
                    GROUP BY PRODUCT_ID
                ) first ON pi.PRODUCT_ID = first.PRODUCT_ID AND pi.IMAGE_ID = first.first_image_id""",
            tuple(product_ids)
        )
        
        variants_by_product = {}
        for v in variants:
            pid = v['product_id']
            if pid not in variants_by_product:
                variants_by_product[pid] = []
            variants_by_product[pid].append(ProductVariantResponse(**v))
        
        images_by_product = {}
        for img in images:
            pid = img['PRODUCT_ID']
            # Map product_id to folder name
            product_num = int(pid.replace('product', ''))
            folder_name = f"product{product_num:02d}"
            images_by_product[pid] = f"/images/{folder_name}/{img['NAME']}"
        
        result = []
        for p in products:
            product_variants = variants_by_product.get(p['product_id'], [])
            product_dict = dict(p)
            # Add thumbnail URL if available
            if p['product_id'] in images_by_product:
                product_dict['thumbnail'] = images_by_product[p['product_id']]
            result.append(ProductDetailResponse(**product_dict, variants=product_variants))
        
        return result
    except Exception as e:
        logger.error(f"Get products with variants error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get products")


@router.get("/{product_id}", response_model=ProductDetailResponse)
async def get_product(product_id: str):
    """Get product by ID with variants"""
    try:
        products = execute_query(
            "SELECT product_id, name, sku, description, category_id, brand_id, store_id, qty_in_stock FROM PRODUCT WHERE product_id = %s",
            (product_id,)
        )
        if not products:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product = products[0]
        variants = execute_query(
            "SELECT variant_id, product_id, color, size, list_price, discount_price, available_qty FROM PRODUCT_VARIANT WHERE product_id = %s",
            (product_id,)
        )
        
        return ProductDetailResponse(**product, variants=[ProductVariantResponse(**v) for v in variants])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get product error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get product")


@router.get("/{product_id}/images")
async def get_product_images(product_id: str):
    """Get all images for a product"""
    try:
        images = execute_query(
            """SELECT IMAGE_ID, PRODUCT_ID, NAME FROM PRODUCT_IMAGES WHERE PRODUCT_ID = %s ORDER BY IMAGE_ID""",
            (product_id,)
        )
        
        # Map product_id to folder name (product0000000000001 -> product01)
        # Extract the numeric part and format it
        product_num = int(product_id.replace('product', ''))
        folder_name = f"product{product_num:02d}"
        
        return [
            {
                "image_id": img['IMAGE_ID'],
                "product_id": img['PRODUCT_ID'],
                "filename": img['NAME'],
                "url": f"/images/{folder_name}/{img['NAME']}"
            }
            for img in images
        ]
    except Exception as e:
        logger.error(f"Get images error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get images")
