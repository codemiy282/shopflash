from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from db import execute_query, execute_insert, execute_delete
from auth import decode_token, extract_token_from_header
import logging

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])
logger = logging.getLogger(__name__)


def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """Dependency to get current user ID from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = extract_token_from_header(authorization)
        user_id = decode_token(token)
        return user_id
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/add")
async def add_to_wishlist(variant_id: int, product_id: str, current_user: str = Depends(get_current_user)):
    """Add a product variant to user's wishlist"""
    try:
        variant = execute_query(
            """SELECT VARIANT_ID, PRODUCT_ID FROM PRODUCT_VARIANT WHERE VARIANT_ID = %s AND PRODUCT_ID = %s""",
            (variant_id, product_id)
        )
        if not variant:
            raise HTTPException(status_code=404, detail="Product variant not found")
        
        wishlist = execute_query(
            """SELECT WISHLIST_ID FROM WISHLIST WHERE BUYER_ID = %s LIMIT 1""",
            (current_user,)
        )
        
        if not wishlist:
            wishlist_id = execute_insert(
                """INSERT INTO WISHLIST (BUYER_ID, DATE_ADDED) VALUES (%s, NOW())""",
                (current_user,)
            )
        else:
            wishlist_id = wishlist[0]['WISHLIST_ID']
        
        existing = execute_query(
            """SELECT * FROM WISHLIST_VARIANT 
               WHERE WISHLIST_ID = %s AND BUYER_ID = %s AND VARIANT_ID = %s AND PRODUCT_ID = %s""",
            (wishlist_id, current_user, variant_id, product_id)
        )
        
        if existing:
            return {"message": "Product already in wishlist", "wishlist_id": wishlist_id}
        
        execute_insert(
            """INSERT INTO WISHLIST_VARIANT (WISHLIST_ID, BUYER_ID, VARIANT_ID, PRODUCT_ID) 
               VALUES (%s, %s, %s, %s)""",
            (wishlist_id, current_user, variant_id, product_id)
        )
        
        return {
            "message": "Added to wishlist successfully",
            "wishlist_id": wishlist_id,
            "variant_id": variant_id,
            "product_id": product_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add to wishlist error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to add to wishlist: {str(e)}")


@router.delete("/{variant_id}")
async def remove_from_wishlist(variant_id: int, product_id: str, current_user: str = Depends(get_current_user)):
    """Remove a product variant from user's wishlist"""
    try:
        wishlist = execute_query(
            """SELECT WISHLIST_ID FROM WISHLIST WHERE BUYER_ID = %s LIMIT 1""",
            (current_user,)
        )
        
        if not wishlist:
            raise HTTPException(status_code=404, detail="Wishlist not found")
        
        wishlist_id = wishlist[0]['WISHLIST_ID']
        execute_delete(
            """DELETE FROM WISHLIST_VARIANT 
               WHERE WISHLIST_ID = %s AND BUYER_ID = %s AND VARIANT_ID = %s AND PRODUCT_ID = %s""",
            (wishlist_id, current_user, variant_id, product_id)
        )
        
        return {"message": "Removed from wishlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Remove from wishlist error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to remove from wishlist")


@router.get("")
async def get_wishlist(current_user: str = Depends(get_current_user)):
    """Get user's wishlist with product details"""
    try:
        wishlist = execute_query(
            """SELECT 
                wv.VARIANT_ID, wv.PRODUCT_ID,
                p.NAME as product_name, p.DESCRIPTION,
                pv.LIST_PRICE, pv.DISCOUNT_PRICE, pv.COLOR, pv.SIZE,
                pv.AVAILABLE_QTY, pv.BARCODE,
                pi.NAME as image_name
               FROM WISHLIST w
               INNER JOIN WISHLIST_VARIANT wv ON w.WISHLIST_ID = wv.WISHLIST_ID AND w.BUYER_ID = wv.BUYER_ID
               INNER JOIN PRODUCT_VARIANT pv ON wv.VARIANT_ID = pv.VARIANT_ID AND wv.PRODUCT_ID = pv.PRODUCT_ID
               INNER JOIN PRODUCT p ON pv.PRODUCT_ID = p.PRODUCT_ID
               LEFT JOIN (
                   SELECT pi.PRODUCT_ID, pi.NAME
                   FROM PRODUCT_IMAGES pi
                   INNER JOIN (
                       SELECT PRODUCT_ID, MIN(IMAGE_ID) as first_image_id
                       FROM PRODUCT_IMAGES
                       GROUP BY PRODUCT_ID
                   ) first ON pi.PRODUCT_ID = first.PRODUCT_ID AND pi.IMAGE_ID = first.first_image_id
               ) pi ON p.PRODUCT_ID = pi.PRODUCT_ID
               WHERE w.BUYER_ID = %s
               ORDER BY w.DATE_ADDED DESC""",
            (current_user,)
        )
        
        result = []
        for item in wishlist:
            # Map product_id to folder name
            product_num = int(item['PRODUCT_ID'].replace('product', ''))
            folder_name = f"product{product_num:02d}"
            thumbnail = f"/images/{folder_name}/{item['image_name']}" if item.get('image_name') else None
            
            result.append({
                "variant_id": item['VARIANT_ID'],
                "product_id": item['PRODUCT_ID'],
                "product_name": item['product_name'],
                "description": item['DESCRIPTION'],
                "list_price": float(item['LIST_PRICE']),
                "discount_price": float(item['DISCOUNT_PRICE']),
                "color": item['COLOR'],
                "size": item['SIZE'],
                "available_qty": item['AVAILABLE_QTY'],
                "barcode": item['BARCODE'],
                "thumbnail": thumbnail
            })
        
        return result
    except Exception as e:
        logger.error(f"Get wishlist error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get wishlist")
