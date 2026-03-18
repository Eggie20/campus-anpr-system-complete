from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import timedelta, datetime
from app.utils.database import get_db
from app.utils.security import verify_password, create_access_token, get_password_hash
from app.models.user import User, UserRole, AccountStatus
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter()

class LoginRequest(BaseModel):
    identifier: str # Can be email, username, or student_id
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class RegisterRequest(BaseModel):
    firstName: str
    lastName: str
    middleName: str = ""
    email: str
    phone: str
    idNumber: str = ""          # License number
    address: str = ""
    relationship: str = "student"  # student / faculty / staff / visitor
    sex: str = ""
    nationality: str = ""
    birthDate: str = ""
    expirationDate: str = ""
    password: str
    # Vehicle fields
    vehicleType: str = "car"
    plateNumber: str
    make: str
    model: str
    year: str = ""
    color: str = ""
    engineNumber: str = ""


# Map relationship to UserRole
RELATIONSHIP_TO_ROLE = {
    "student": UserRole.student,
    "faculty": UserRole.faculty,
    "staff": UserRole.staff,
    "visitor": UserRole.visitor,
}


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    from sqlalchemy import func
    
    # Find user by email, username, or student_id (case-insensitive for email/username)
    user = db.query(User).filter(
        or_(
            func.lower(User.email) == func.lower(login_data.identifier),
            func.lower(User.username) == func.lower(login_data.identifier),
            User.student_id == login_data.identifier
        )
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found. Please check your ID or Email.",
        )
    
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again.",
        )
    
    if user.status != AccountStatus.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {user.status}. Please contact admin.",
        )

    access_token_expires = timedelta(minutes=60 * 24) # 24 hours
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value.lower(), # Lowercase for frontend compatibility
            "student_id": user.student_id,
            "department": user.department
        }
    }


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user with their vehicle.
    Creates a User record and a Vehicle record in a single transaction.
    """
    from sqlalchemy import func

    # 1. Validate email uniqueness
    existing = db.query(User).filter(
        func.lower(User.email) == func.lower(data.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists."
        )

    # 2. Validate plate number uniqueness
    existing_vehicle = db.query(Vehicle).filter(
        Vehicle.plate_number == data.plateNumber.upper()
    ).first()
    if existing_vehicle:
        raise HTTPException(
            status_code=400,
            detail="A vehicle with this plate number is already registered."
        )

    # 3. Build full name and username
    full_name = f"{data.firstName} {data.middleName} {data.lastName}".replace("  ", " ").strip()
    # Generate username from email (part before @)
    username = data.email.split("@")[0].lower()
    # Ensure unique username
    counter = 1
    base_username = username
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    # 4. Map relationship to role
    role = RELATIONSHIP_TO_ROLE.get(data.relationship.lower(), UserRole.visitor)

    # 5. Create User
    new_user = User(
        email=data.email,
        username=username,
        password_hash=get_password_hash(data.password),
        full_name=full_name,
        role=role,
        status=AccountStatus.pending,
        phone_number=data.phone,
    )

    db.add(new_user)
    db.flush()  # Get user ID without committing

    # 6. Map vehicle type
    try:
        v_type = VehicleType(data.vehicleType.lower())
    except ValueError:
        v_type = VehicleType.other

    # 7. Create Vehicle
    new_vehicle = Vehicle(
        user_id=new_user.id,
        plate_number=data.plateNumber.upper(),
        type=v_type,
        make=data.make,
        model=data.model,
        color=data.color or None,
        status=VehicleStatus.pending,
        registration_date=datetime.now()
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_user)
    db.refresh(new_vehicle)

    return {
        "success": True,
        "message": "Registration successful! Your account is pending admin approval.",
        "user": {
            "id": str(new_user.id),
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role.value,
            "status": new_user.status.value,
            "username": new_user.username
        },
        "vehicle": {
            "id": str(new_vehicle.id),
            "plate_number": new_vehicle.plate_number,
            "type": new_vehicle.type.value,
            "make": new_vehicle.make,
            "model": new_vehicle.model
        }
    }

