import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.utils.database import SessionLocal
from app.models.user import User

db = SessionLocal()
user = db.query(User).filter(User.email == "jessiebryn.vasquez@csucc.edu.ph").first()
if user:
    print(f"ID: {user.id}")
    print(f"Full Name: '{user.full_name}'")
    print(f"First Name: '{user.first_name}'")
    print(f"Last Name: '{user.last_name}'")
    print(f"Middle Name: '{user.middle_name}'")
    print(f"Sex: '{user.sex}'")
    print(f"DOB: '{user.birth_date}'")
    print(f"Phone: '{user.phone_number}'")
else:
    print("User not found")
db.close()
