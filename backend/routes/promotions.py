"""
Promotions routes for the ShopFlash API.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from db import get_db_connection
from schemas import PromotionResponse

router = APIRouter()


@router.get("/promotions", response_model=List[PromotionResponse])
def get_promotions():
    """Get all active promotions"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT promotion_id, description, discount_type, discount_value,
                       max_discount_amount, usage_limit, status, start_date, end_date
                FROM PROMOTION
                WHERE status = 'active'
                ORDER BY start_date DESC
            """)
            promotions = cursor.fetchall()
            
            return [PromotionResponse(**promo) for promo in promotions]
    finally:
        conn.close()


@router.get("/promotions/all", response_model=List[PromotionResponse])
def get_all_promotions():
    """Get all promotions (including inactive)"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT promotion_id, description, discount_type, discount_value,
                       max_discount_amount, usage_limit, status, start_date, end_date
                FROM PROMOTION
                ORDER BY start_date DESC
            """)
            promotions = cursor.fetchall()
            
            return [PromotionResponse(**promo) for promo in promotions]
    finally:
        conn.close()


@router.get("/promotions/{promotion_id}", response_model=PromotionResponse)
def get_promotion(promotion_id: int):
    """Get a specific promotion"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT promotion_id, description, discount_type, discount_value,
                       max_discount_amount, usage_limit, status, start_date, end_date
                FROM PROMOTION
                WHERE promotion_id = %s
            """, (promotion_id,))
            promotion = cursor.fetchone()
            
            if not promotion:
                raise HTTPException(status_code=404, detail="Promotion not found")
            
            return PromotionResponse(**promotion)
    finally:
        conn.close()
