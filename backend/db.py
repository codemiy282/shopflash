"""Simple direct MySQL database connection without ORM"""
import pymysql
from pymysql.cursors import DictCursor
import os
from urllib.parse import urlparse, unquote
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Parse DATABASE_URL from environment or use default
def get_db_config():
    database_url = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/Ecommerce')
    
    # Parse the URL
    parsed = urlparse(database_url)
    
    # Extract components (unquote to decode URL-encoded characters like %40 -> @)
    host = parsed.hostname or 'localhost'
    user = unquote(parsed.username) if parsed.username else 'root'
    password = unquote(parsed.password) if parsed.password else 'password'
    database = parsed.path.lstrip('/') or 'Ecommerce'
    port = parsed.port or 3306
    
    # Check if SSL should be used (for Azure MySQL)
    use_ssl = 'mysql.database.azure.com' in host
    
    config = {
        'host': host,
        'user': user,
        'password': password,
        'database': database,
        'port': port,
        'charset': 'utf8mb4',
        'cursorclass': DictCursor,
    }
    
    if use_ssl:
        import ssl
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        config['ssl'] = ssl_ctx
    
    return config

# Don't cache DB_CONFIG - regenerate each time to pick up .env changes
# DB_CONFIG = get_db_config()

def get_db_connection():
    """Get a new database connection"""
    return pymysql.connect(**get_db_config())

def execute_query(query, args=None):
    """Execute a SELECT query and return results"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, args or ())
            return cursor.fetchall()
    finally:
        conn.close()

def execute_insert(query, args=None):
    """Execute an INSERT query and return the inserted ID"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, args or ())
            conn.commit()
            return cursor.lastrowid
    finally:
        conn.close()

def execute_update(query, args=None):
    """Execute an UPDATE query"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, args or ())
            conn.commit()
            return cursor.rowcount
    finally:
        conn.close()

def execute_delete(query, args=None):
    """Execute a DELETE query"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, args or ())
            conn.commit()
            return cursor.rowcount
    finally:
        conn.close()
