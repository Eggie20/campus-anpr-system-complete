import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the current directory to path so we can import app
sys.path.append(os.getcwd())

from app.config import settings
from app.models.user import User
from app.utils.security import verify_password

def test_login():
    try:
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        email = "security@example.com"
        password = "SecurityPassword123"
        
        print(f"Testing login for {email}...")
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print("User not found!")
            return
            
        print(f"User found: {user.username}, Role: {user.role}")
        
        if verify_password(password, user.password_hash):
            print("Password verified!")
        else:
            print("Password verification failed!")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_login()
