"""
Payment methods routes for the ShopFlash API.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from db import get_db_connection
from schemas import PaymentMethodResponse

router = APIRouter()


@router.get("/payment-methods", response_model=List[PaymentMethodResponse])
def get_payment_methods():
    """Get all available payment methods"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT method_id, name 
                FROM METHOD
            """)
            methods = cursor.fetchall()
            
            return [PaymentMethodResponse(**method) for method in methods]
    finally:
        conn.close()


@router.get("/payment-methods/{method_id}", response_model=PaymentMethodResponse)
def get_payment_method(method_id: int):
    """Get a specific payment method"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT method_id, name 
                FROM METHOD
                WHERE method_id = %s
            """, (method_id,))
            method = cursor.fetchone()
            
            if not method:
                raise HTTPException(status_code=404, detail="Payment method not found")
            
            return PaymentMethodResponse(**method)
    finally:
        conn.close()
