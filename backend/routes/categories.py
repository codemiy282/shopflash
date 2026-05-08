from fastapi import APIRouter, HTTPException
from db import execute_query
from schemas import CategoryResponse, BrandResponse, CountryResponse
import logging

router = APIRouter(prefix="/api", tags=["Categories & Brands"])
logger = logging.getLogger(__name__)


@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories():
    """Get all categories"""
    try:
        categories = execute_query("SELECT category_id, name FROM CATEGORY")
        return [CategoryResponse(**c) for c in categories]
    except Exception as e:
        logger.error(f"Get categories error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get categories")


@router.get("/brands", response_model=list[BrandResponse])
async def get_brands():
    """Get all brands"""
    try:
        brands = execute_query("SELECT brand_id, name FROM BRAND")
        return [BrandResponse(**b) for b in brands]
    except Exception as e:
        logger.error(f"Get brands error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get brands")


@router.get("/countries", response_model=list[CountryResponse])
async def get_countries():
    """Get all countries"""
    try:
        countries = execute_query("SELECT country_id, country_name FROM COUNTRY ORDER BY country_name")
        return [CountryResponse(**c) for c in countries]
    except Exception as e:
        logger.error(f"Get countries error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get countries")
