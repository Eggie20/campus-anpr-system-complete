from sqlalchemy import create_engine, text
from app.config import settings
import bcrypt

engine = create_engine(settings.DATABASE_URL)
with engine.connect() as conn:
    sql = text("SELECT email, password_hash FROM users WHERE email='admin@example.com'")
    result = conn.execute(sql).fetchone()
    if result:
        email, h = result
        print(f"User: {email}")
        print(f"Hash in DB: {h}")
        p = "AdminPassword123"
        try:
            match = bcrypt.checkpw(p.encode('utf-8'), h.encode('utf-8'))
            print(f"Password 'AdminPassword123' match: {match}")
        except Exception as e:
            print(f"Error checking password: {e}")
    else:
        print("User admin@example.com not found in DB")
