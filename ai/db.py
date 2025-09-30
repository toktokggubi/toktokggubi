import os
import logging
try:
    import psycopg2
    from psycopg2 import sql
    PSYCOPG2_AVAILABLE = True
    DB_HOST = os.environ.get("DB_HOST")
    DB_NAME = os.environ.get("POSTGRES_DB")
    DB_USER = os.environ.get("POSTGRES_USER")
    DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
    DB_PORT = os.environ.get("POSTGRES_PORT")
except ImportError:
    PSYCOPG2_AVAILABLE = False
    # Define logger here for error messages
    logger = logging.getLogger(__name__)
    win_msg = " For Windows, it is recommended to install 'psycopg2-binary' via pip."
    logger.warning(
        f"psycopg2 is not installed.{win_msg if os.name == 'nt' else ''} "
        "Database operations will be disabled."
    )

logger = logging.getLogger(__name__)

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    if not PSYCOPG2_AVAILABLE:
        logger.error("Cannot connect to database because 'psycopg2' library is not installed.")
        return None
    if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
        logger.error("Database connection details are not fully configured. Please set DB_HOST, POSTGRES_DB, POSTGRES_USER, and POSTGRES_PASSWORD environment variables.")
        return None
    try:
        # Explicitly tell psycopg2 not to look for pgpass.conf to avoid UnicodeDecodeError on Windows
        conn = psycopg2.connect(
            host=DB_HOST,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,  # Explicitly set the port to 5432
            client_encoding='utf8'
        )
        return conn
    except UnicodeDecodeError as e:
        logger.error(f"A Unicode decoding error occurred during database connection: {e}")
        logger.error("This is a common issue on Windows if a PostgreSQL configuration file (e.g., pgpass.conf) is not saved in UTF-8 format.")
        logger.error(r"To fix this, find the file at '%APPDATA%\postgresql\pgpass.conf', open it, and re-save it with 'UTF-8' encoding.")
        return None
    except psycopg2.OperationalError as e:
        logger.error(f"Could not connect to PostgreSQL database: {e}")
        return None

def register_user_if_not_exists(user_id, username):
    """Checks if a user exists by user_id and registers/updates them."""
    conn = get_db_connection()
    if not conn:
        logger.warning("Cannot register user because database connection is not available.")
        return

    try:
        with conn.cursor() as cur:
            # Insert the user if they don't exist. If they do, update their username.
            # This handles both new user registration and username changes for existing users.
            insert_query = sql.SQL("""
                INSERT INTO users (user_id, username) VALUES (%s, %s)
                ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username;
            """)
            cur.execute(insert_query, (user_id, username))
            conn.commit()
            logger.info(f"User '{username}' (ID: {user_id}) registration/update processed.")
    except Exception as e:
        logger.error(f"Error during user registration for user_id '{user_id}': {e}", exc_info=True)
        conn.rollback()
    finally:
        if conn:
            conn.close()

def get_all_users():
    """Fetches all registered users from the database."""
    conn = get_db_connection()
    if not conn:
        logger.error("Cannot fetch users because database connection is not available.")
        return []
    
    users = []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id, username FROM users;")
            for user_id, username in cur.fetchall():
                users.append({"user_id": user_id, "username": username})
    except Exception as e:
        logger.error(f"Error fetching all users: {e}", exc_info=True)
    finally:
        if conn:
            conn.close()
    return users


