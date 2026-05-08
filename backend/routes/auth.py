from fastapi import APIRouter, HTTPException, status, Header, Depends
from datetime import datetime
from typing import Optional
from schemas import (
    RegisterRequest, UserResponse, LoginRequest, TokenResponse,
    UserUpdateRequest, ChangePasswordRequest, ChangePasswordResponse
)
from db import execute_query, execute_insert, execute_update, get_db_connection
import auth
import traceback

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """Dependency to get current user ID from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = auth.extract_token_from_header(authorization)
        user_id = auth.decode_token(token)
        return user_id
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/register", response_model=TokenResponse)
def register(user_data: RegisterRequest):
    """Register a new user using stored procedure"""
    try:
        # Hash the password
        password_hash = auth.hash_password(user_data.password)
        
        # Call stored procedure to create buyer user
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.callproc('sp_CreateBuyerUser', [
                    user_data.username,
                    user_data.email,
                    user_data.phone_number,
                    password_hash,
                    user_data.birthdate
                ])
                
                result = cursor.fetchone()
                
                if not result or not result.get('NewUserID'):
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to create user"
                    )
                
                user_id = result['NewUserID']
                conn.commit()
        finally:
            conn.close()
        
        # Create access token
        access_token = auth.create_access_token(str(user_id))
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=str(user_id)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Register error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest):
    """Login user with username and password"""
    try:
        users = execute_query(
            "SELECT USER_ID, USERNAME, PASSWORD_HASH, STATUS FROM USERS WHERE USERNAME = %s",
            (credentials.username,)
        )
        
        if not users:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        user = users[0]
        
        if not auth.verify_password(credentials.password, user['PASSWORD_HASH']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        if user['STATUS'] != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is not active"
            )
        
        # Create access token
        access_token = auth.create_access_token(user['USER_ID'])
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user['USER_ID']
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: str = Depends(get_current_user)):
    """Get current logged-in user information"""
    try:
        users = execute_query(
            "SELECT USER_ID, USERNAME, EMAIL, PHONE_NUMBER, BIRTHDATE, STATUS, CREATION_TIMESTAMP FROM USERS WHERE USER_ID = %s",
            (current_user,)
        )
        
        if not users:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(**users[0])
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get user info error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to get user info")


@router.put("/me", response_model=UserResponse)
def update_current_user(
    req: UserUpdateRequest, 
    current_user: str = Depends(get_current_user)
):
    """Update current logged-in user information"""
    try:
        # Check if user exists
        users = execute_query(
            "SELECT USER_ID FROM USERS WHERE USER_ID = %s",
            (current_user,)
        )
        
        if not users:
            raise HTTPException(status_code=404, detail="User not found")
        
        updates = []
        params = []
        
        if req.username is not None:
            # Check if username is taken
            existing = execute_query(
                "SELECT USER_ID FROM USERS WHERE USERNAME = %s AND USER_ID != %s",
                (req.username, current_user)
            )
            if existing:
                raise HTTPException(status_code=400, detail="Username already taken")
            updates.append("username = %s")
            params.append(req.username)
        
        if req.email is not None:
            # Check if email is taken
            existing = execute_query(
                "SELECT USER_ID FROM USERS WHERE EMAIL = %s AND USER_ID != %s",
                (req.email, current_user)
            )
            if existing:
                raise HTTPException(status_code=400, detail="Email already taken")
            updates.append("email = %s")
            params.append(req.email)
        
        if req.phone_number is not None:
            updates.append("phone_number = %s")
            params.append(req.phone_number)
        
        if req.birthdate is not None:
            updates.append("birthdate = %s")
            params.append(req.birthdate)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(current_user)
        # Map lowercase to uppercase column names
        updates_upper = [u.replace('username', 'USERNAME').replace('email', 'EMAIL').replace('phone_number', 'PHONE_NUMBER').replace('birthdate', 'BIRTHDATE') for u in updates]
        execute_update(
            f"UPDATE USERS SET {', '.join(updates_upper)} WHERE USER_ID = %s",
            tuple(params)
        )
        
        # Fetch updated user
        updated_users = execute_query(
            "SELECT USER_ID, USERNAME, EMAIL, PHONE_NUMBER, BIRTHDATE, STATUS, CREATION_TIMESTAMP FROM USERS WHERE USER_ID = %s",
            (current_user,)
        )
        
        return UserResponse(**updated_users[0])
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update user error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")


@router.put("/change-password", response_model=ChangePasswordResponse)
def change_password(
    req: ChangePasswordRequest, 
    current_user: str = Depends(get_current_user)
):
    """Change password for current logged-in user"""
    try:
        users = execute_query(
            "SELECT USER_ID, PASSWORD_HASH FROM USERS WHERE USER_ID = %s",
            (current_user,)
        )
        
        if not users:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = users[0]
        
        # Verify current password
        if not auth.verify_password(req.current_password, user['PASSWORD_HASH']):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Update password
        new_password_hash = auth.hash_password(req.new_password)
        execute_update(
            "UPDATE USERS SET PASSWORD_HASH = %s WHERE USER_ID = %s",
            (new_password_hash, current_user)
        )
        
        return ChangePasswordResponse(success=True, message="Password changed successfully")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Change password error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to change password")
