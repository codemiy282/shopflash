"""
Shipping options routes for the ShopFlash API.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from db import get_db_connection
from schemas import ShippingOptionResponse

router = APIRouter()


@router.get("/shipping", response_model=List[ShippingOptionResponse])
def get_shipping_options():
    """Get all available shipping options with their service types"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Get all logistics partners
            cursor.execute("""
                SELECT partner_id, name, rating 
                FROM LOGISTICS_PARTNER
            """)
            partners = cursor.fetchall()
            
            if not partners:
                return []
            
            # Get service types for each partner
            result = []
            for partner in partners:
                cursor.execute("""
                    SELECT SERVICE_TYPE 
                    FROM SERVICE_TYPES 
                    WHERE partner_id = %s
                """, (partner['partner_id'],))
                service_types = cursor.fetchall()
                
                result.append(ShippingOptionResponse(
                    partner_id=partner['partner_id'],
                    name=partner['name'],
                    rating=partner['rating'],
                    service_types=[st['SERVICE_TYPE'] for st in service_types]
                ))
            
            return result
    finally:
        conn.close()


@router.get("/shipping/{partner_id}", response_model=ShippingOptionResponse)
def get_shipping_option(partner_id: int):
    """Get a specific shipping partner with their service types"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Get the logistics partner
            cursor.execute("""
                SELECT partner_id, name, rating 
                FROM LOGISTICS_PARTNER
                WHERE partner_id = %s
            """, (partner_id,))
            partner = cursor.fetchone()
            
            if not partner:
                raise HTTPException(status_code=404, detail="Shipping partner not found")
            
            # Get service types
            cursor.execute("""
                SELECT SERVICE_TYPE 
                FROM SERVICE_TYPES 
                WHERE partner_id = %s
            """, (partner_id,))
            service_types = cursor.fetchall()
            
            return ShippingOptionResponse(
                partner_id=partner['partner_id'],
                name=partner['name'],
                rating=partner['rating'],
                service_types=[st['SERVICE_TYPE'] for st in service_types]
            )
    finally:
        conn.close()
