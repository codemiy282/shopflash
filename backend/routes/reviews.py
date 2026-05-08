from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from db import execute_query, execute_insert
from schemas import ReviewResponse, ReviewCreateRequest
from auth import decode_token, extract_token_from_header
import logging

router = APIRouter(prefix="/api/products", tags=["Reviews"])
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


@router.get("/{product_id}/reviews", response_model=list[ReviewResponse])
async def get_reviews(product_id: str):
    """Get reviews - returns recent reviews"""
    try:
        reviews = execute_query(
            """SELECT review_id, order_id, user_id, rating_score as rating, comment, created_at 
               FROM REVIEW ORDER BY created_at DESC LIMIT 10""",
            ()
        )
        return [ReviewResponse(**r) for r in reviews]
    except Exception as e:
        logger.error(f"Get reviews error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get reviews")


@router.post("/{product_id}/reviews", response_model=ReviewResponse)
async def create_review(product_id: str, req: ReviewCreateRequest, current_user: str = Depends(get_current_user)):
    """Create review for a product"""
    try:
        line_items = execute_query(
            """SELECT oli.line_item_id, oli.order_id FROM ORDER_LINE_ITEM oli
               INNER JOIN ORDERS o ON oli.order_id = o.order_id
               LEFT JOIN REVIEW r ON oli.line_item_id = r.line_item_id AND oli.order_id = r.order_id
               WHERE o.user_id = %s AND r.review_id IS NULL
               LIMIT 1""",
            (current_user,)
        )
        
        if not line_items:
            line_items = execute_query(
                """SELECT oli.line_item_id, oli.order_id FROM ORDER_LINE_ITEM oli
                   LEFT JOIN REVIEW r ON oli.line_item_id = r.line_item_id AND oli.order_id = r.order_id
                   WHERE r.review_id IS NULL
                   LIMIT 1""",
                ()
            )
        
        if not line_items:
            raise HTTPException(status_code=404, detail="No line items available for review")
        
        line_item = line_items[0]
        logs = execute_query("SELECT LOG_ID FROM event_log ORDER BY LOG_ID DESC LIMIT 1", ())
        
        if not logs:
            raise HTTPException(status_code=500, detail="No event logs available")
        
        log_id = logs[0]['LOG_ID']
        review_id = execute_insert(
            """INSERT INTO REVIEW (line_item_id, order_id, user_id, log_id, rating_score, comment, created_at)
               VALUES (%s, %s, %s, %s, %s, %s, NOW())""",
            (line_item['line_item_id'], line_item['order_id'], current_user, log_id, req.rating, req.comment)
        )
        
        reviews = execute_query(
            """SELECT review_id, order_id, user_id, rating_score as rating, comment, created_at 
               FROM REVIEW WHERE review_id = %s""",
            (review_id,)
        )
        return ReviewResponse(**reviews[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create review error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")
