from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from db import execute_query, execute_insert, execute_update, execute_delete
from schemas import AddressResponse, AddressCreateRequest
from auth import decode_token, extract_token_from_header
import logging

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])
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


@router.get("", response_model=list[AddressResponse])
async def get_addresses(current_user: str = Depends(get_current_user)):
    """Get user's addresses"""
    try:
        addresses = execute_query(
            """SELECT address_id, country_id, user_id, unit_number, street_number, region, city, address_line, postal_code 
               FROM ADDRESS WHERE user_id = %s""",
            (current_user,)
        )
        return [AddressResponse(**a) for a in addresses]
    except Exception as e:
        logger.error(f"Get addresses error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get addresses")


@router.get("/{address_id}", response_model=AddressResponse)
async def get_address(address_id: int, current_user: str = Depends(get_current_user)):
    """Get address by ID"""
    try:
        addresses = execute_query(
            """SELECT address_id, country_id, user_id, unit_number, street_number, region, city, address_line, postal_code 
               FROM ADDRESS WHERE address_id = %s AND user_id = %s""",
            (address_id, current_user)
        )
        if not addresses:
            raise HTTPException(status_code=404, detail="Address not found")
        
        return AddressResponse(**addresses[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get address error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get address")


@router.post("", response_model=AddressResponse)
async def create_address(req: AddressCreateRequest, current_user: str = Depends(get_current_user)):
    """Create new address"""
    try:
        address_id = execute_insert(
            """INSERT INTO ADDRESS (country_id, user_id, unit_number, street_number, region, city, address_line, postal_code)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (req.country_id, current_user, req.unit_number, req.street_number, req.region, req.city, req.address_line, req.postal_code)
        )
        
        addresses = execute_query(
            """SELECT address_id, country_id, user_id, unit_number, street_number, region, city, address_line, postal_code 
               FROM ADDRESS WHERE address_id = %s""",
            (address_id,)
        )
        return AddressResponse(**addresses[0])
    except Exception as e:
        logger.error(f"Create address error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create address")


@router.put("/{address_id}", response_model=AddressResponse)
async def update_address(address_id: int, req: AddressCreateRequest, current_user: str = Depends(get_current_user)):
    """Update an existing address"""
    try:
        existing = execute_query(
            "SELECT address_id FROM ADDRESS WHERE address_id = %s AND user_id = %s",
            (address_id, current_user)
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Address not found")
        
        execute_update(
            """UPDATE ADDRESS SET country_id = %s, unit_number = %s, street_number = %s, 
               region = %s, city = %s, address_line = %s, postal_code = %s
               WHERE address_id = %s AND user_id = %s""",
            (req.country_id, req.unit_number, req.street_number, req.region, req.city, 
             req.address_line, req.postal_code, address_id, current_user)
        )
        
        addresses = execute_query(
            """SELECT address_id, country_id, user_id, unit_number, street_number, region, city, address_line, postal_code 
               FROM ADDRESS WHERE address_id = %s""",
            (address_id,)
        )
        return AddressResponse(**addresses[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update address error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update address")


@router.delete("/{address_id}")
async def delete_address(address_id: int, current_user: str = Depends(get_current_user)):
    """Delete an address"""
    try:
        existing = execute_query(
            "SELECT address_id FROM ADDRESS WHERE address_id = %s AND user_id = %s",
            (address_id, current_user)
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Address not found")
        
        execute_delete("DELETE FROM ADDRESS WHERE address_id = %s AND user_id = %s", (address_id, current_user))
        
        return {"message": "Address deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete address error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete address")
