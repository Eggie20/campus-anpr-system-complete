import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.utils.database import SessionLocal
from app.models.user import User, AccountStatus
from app.models.vehicle import Vehicle
from app.models.notification import Notification
from app.models.entry_log import EntryLog
from app.utils.security import verify_password

db = SessionLocal()
try:
    # Test all seeded users
    test_users = [
        ("admin@example.com", "AdminPassword123", "admin"),
        ("student@example.com", "StudentPassword123", "student"),
        ("faculty@example.com", "FacultyPassword123", "faculty"),
        ("security@example.com", "SecurityPassword123", "security"),
        ("staff@example.com", "StaffPassword123", "staff"),
        ("visitor@example.com", "VisitorPassword123", "visitor"),
    ]
    
    print("=" * 60)
    print("LOGIN TEST FOR ALL SEEDED USERS")
    print("=" * 60)
    
    all_passed = True
    for email, password, expected_role in test_users:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"\n[FAIL] {expected_role.upper()}: User not found - {email}")
            all_passed = False
            continue
            
        # Verify password
        is_valid = verify_password(password, user.password_hash)
        
        # Get role as lowercase string (as returned by API)
        role_value = user.role.value.lower()
        
        # Check all conditions
        status_ok = user.status == AccountStatus.active
        role_ok = role_value == expected_role
        
        passed = is_valid and status_ok and role_ok
        status_icon = "[PASS]" if passed else "[FAIL]"
        if not passed:
            all_passed = False
        
        print(f"\n{status_icon} {expected_role.upper()}:")
        print(f"   Email: {email}")
        print(f"   Password Valid: {is_valid}")
        print(f"   Status: {user.status.value} (Active: {status_ok})")
        print(f"   Role: {role_value} (Expected: {expected_role}, Match: {role_ok})")
    
    print("\n" + "=" * 60)
    print(f"TEST RESULT: {'ALL PASSED' if all_passed else 'SOME FAILED'}")
    print("=" * 60)
        
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
finally:
    db.close()
