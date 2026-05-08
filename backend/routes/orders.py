from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from db import execute_query, execute_insert
from schemas import OrderResponse, OrderCreateRequest, OrderLineItemResponse
from auth import decode_token, extract_token_from_header
import logging

router = APIRouter(prefix="/api/orders", tags=["Orders"])
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


@router.get("", response_model=list[OrderResponse])
async def get_orders(current_user: str = Depends(get_current_user)):
    """Get user's orders"""
    try:
        orders = execute_query(
            """SELECT order_id, user_id, address_id, shipment_id, fullname, phone_number, 
                      total_amount, total_money, tax, status, created_timestamp 
               FROM ORDERS WHERE user_id = %s ORDER BY created_timestamp DESC""",
            (current_user,)
        )
        return [OrderResponse(**o) for o in orders]
    except Exception as e:
        logger.error(f"Get orders error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get orders")


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, current_user: str = Depends(get_current_user)):
    """Get order by ID"""
    try:
        orders = execute_query(
            """SELECT order_id, user_id, address_id, shipment_id, fullname, phone_number, 
                      total_amount, total_money, tax, status, created_timestamp 
               FROM ORDERS WHERE order_id = %s AND user_id = %s""",
            (order_id, current_user)
        )
        if not orders:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return OrderResponse(**orders[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get order error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get order")


@router.post("", response_model=OrderResponse)
async def create_order(req: OrderCreateRequest, current_user: str = Depends(get_current_user)):
    """Create new order"""
    try:
        order_id = execute_insert(
            """INSERT INTO ORDERS (user_id, address_id, shipment_id, fullname, phone_number, total_amount, total_money, tax, status, created_timestamp)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())""",
            (current_user, req.address_id, 1, req.fullname, req.phone_number, req.total_amount, req.total_money, req.tax, "processing")
        )
        
        orders = execute_query(
            """SELECT order_id, user_id, address_id, shipment_id, fullname, phone_number, 
                      total_amount, total_money, tax, status, created_timestamp 
               FROM ORDERS WHERE order_id = %s""",
            (order_id,)
        )
        return OrderResponse(**orders[0])
    except Exception as e:
        logger.error(f"Create order error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create order")


@router.get("/{order_id}/items", response_model=list[OrderLineItemResponse])
async def get_order_items(order_id: int, current_user: str = Depends(get_current_user)):
    """Get order line items"""
    try:
        orders = execute_query("SELECT order_id FROM ORDERS WHERE order_id = %s AND user_id = %s", (order_id, current_user))
        if not orders:
            raise HTTPException(status_code=404, detail="Order not found")
        
        items = execute_query(
            """SELECT oli.line_item_id, oli.order_id, oliv.variant_id, oliv.product_id,
                      oli.quantity, oli.unit_price, oli.discount, oli.subtotal 
               FROM ORDER_LINE_ITEM oli
               LEFT JOIN ORDER_LINE_ITEM_VARIANT oliv ON oli.line_item_id = oliv.line_item_id AND oli.order_id = oliv.order_id
               WHERE oli.order_id = %s""",
            (order_id,)
        )
        return [OrderLineItemResponse(**item) for item in items]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get order items error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get order items")
