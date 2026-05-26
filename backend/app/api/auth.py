import os
import uuid
import json
import base64
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import timedelta, datetime, timezone

from app.utils.database import get_db
from app.utils.security import verify_password, create_access_token, get_password_hash, get_current_user
from app.models.user import User, UserRole, AccountStatus
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from pydantic import BaseModel

router = APIRouter()

SECURE_UPLOADS_DIR = Path("secure_uploads")
SECURE_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

class LoginRequest(BaseModel):
    identifier: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

RELATIONSHIP_TO_ROLE = {
    "student": UserRole.student,
    "faculty": UserRole.faculty,
    "staff": UserRole.staff,
    "visitor": UserRole.visitor,
}

def _generate_qr_code(data: dict, filepath: str) -> str:
    import qrcode
    import io
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(json.dumps(data))
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filepath)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def _save_upload_file(upload_file: UploadFile, destination: str):
    import shutil
    with open(destination, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    from sqlalchemy import func
    user = db.query(User).filter(
        or_(
            func.lower(User.email) == func.lower(login_data.identifier),
            func.lower(User.username) == func.lower(login_data.identifier),
            User.student_id == login_data.identifier,
            User.faculty_id == login_data.identifier,
            User.staff_id == login_data.identifier,
            User.drivers_license_no == login_data.identifier
        )
    ).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid ID/Email or Password.")
    
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid ID/Email or Password.")
    
    if user.status != AccountStatus.active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Account is {user.status}. Please contact admin.")

    access_token_expires = timedelta(minutes=60 * 24)
    access_token = create_access_token(subject=user.id, expires_delta=access_token_expires)
    
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "first_name": user.first_name,
            "middle_name": user.middle_name,
            "last_name": user.last_name,
            "sex": user.sex.value if user.sex else None,
            "birth_date": str(user.birth_date) if user.birth_date else None,
            "nationality": user.nationality,
            "phone_number": user.phone_number,
            "address": user.address,
            "drivers_license_no": user.drivers_license_no,
            "license_expiry_date": str(user.license_expiry_date) if user.license_expiry_date else None,
            "academic_program": user.academic_program,
            "year_level": user.year_level,
            "role": user.role.value.lower(),
            "status": user.status.value,
            "student_id": user.student_id,
            "department": user.department
        }
    }

class DuplicateCheckRequest(BaseModel):
    licenseNumber: Optional[str] = None
    email: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    plateNumber: Optional[str] = None

@router.post("/check-duplicate")
def check_duplicate(data: DuplicateCheckRequest, db: Session = Depends(get_db)):
    """
    Early duplicate detection — called right after OCR scan extracts data.
    Returns which fields (if any) already exist in the database.
    """
    from sqlalchemy import func
    duplicates = []

    if data.licenseNumber and data.licenseNumber.strip():
        existing = db.query(User).filter(
            User.drivers_license_no == data.licenseNumber.strip()
        ).first()
        if existing:
            duplicates.append({
                "field": "licenseNumber",
                "label": "Driver's License No.",
                "value": data.licenseNumber.strip(),
                "existingUser": f"{existing.first_name} {existing.last_name}",
                "status": existing.status.value if existing.status else "unknown"
            })

    if data.email and data.email.strip():
        existing = db.query(User).filter(
            func.lower(User.email) == func.lower(data.email.strip())
        ).first()
        if existing:
            duplicates.append({
                "field": "email",
                "label": "Email Address",
                "value": data.email.strip(),
                "existingUser": f"{existing.first_name} {existing.last_name}",
                "status": existing.status.value if existing.status else "unknown"
            })

    if data.firstName and data.lastName:
        existing = db.query(User).filter(
            func.lower(User.first_name) == func.lower(data.firstName.strip()),
            func.lower(User.last_name) == func.lower(data.lastName.strip())
        ).first()
        if existing:
            duplicates.append({
                "field": "name",
                "label": "Full Name",
                "value": f"{data.firstName.strip()} {data.lastName.strip()}",
                "existingUser": f"{existing.first_name} {existing.last_name}",
                "status": existing.status.value if existing.status else "unknown"
            })

    if data.plateNumber and data.plateNumber.strip():
        existing = db.query(Vehicle).filter(
            Vehicle.plate_number == data.plateNumber.strip().upper()
        ).first()
        if existing:
            owner = db.query(User).filter(User.id == existing.user_id).first()
            duplicates.append({
                "field": "plateNumber",
                "label": "Plate Number",
                "value": data.plateNumber.strip().upper(),
                "existingUser": f"{owner.first_name} {owner.last_name}" if owner else "Unknown",
                "status": owner.status.value if owner and owner.status else "unknown"
            })

    return {
        "hasDuplicates": len(duplicates) > 0,
        "duplicates": duplicates,
        "message": f"Found {len(duplicates)} existing record(s) matching this data." if duplicates else "No duplicates found."
    }

@router.post("/register")
async def register(
    firstName: str = Form(...),
    lastName: str = Form(...),
    middleName: str = Form(""),
    email: str = Form(...),
    phone: str = Form(""),
    idNumber: str = Form(""),
    address: str = Form(""),
    relationship: str = Form("student"),
    sex: str = Form(""),
    nationality: str = Form(""),
    birthDate: str = Form(""),
    password: str = Form(...),

    studentId: Optional[str] = Form(None),
    course: Optional[str] = Form(None),
    yearLevel: Optional[str] = Form(None),
    section: Optional[str] = Form(None),

    facultyId: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    position: Optional[str] = Form(None),
    employmentType: Optional[str] = Form(None),

    staffId: Optional[str] = Form(None),
    staffDepartment: Optional[str] = Form(None),
    jobTitle: Optional[str] = Form(None),
    employmentStatus: Optional[str] = Form(None),

    visitorPurpose: Optional[str] = Form(None),
    visitorHost: Optional[str] = Form(None),
    visitorReason: Optional[str] = Form(None),
    visitorValidId: Optional[str] = Form(None),
    visitorDate: Optional[str] = Form(None),
    visitorDuration: Optional[str] = Form(None),
    entryMotive: Optional[str] = Form(None),

    vehicleType: str = Form("car"),
    otherVehicleType: Optional[str] = Form(None),
    plateNumber: str = Form(...),
    brand: str = Form(...),
    color: str = Form(""),

    anprFlagged: str = Form("false"),
    anprFlagMsg: Optional[str] = Form(None),

    ocrScanJson: Optional[str] = Form(None),
    idPhoto: Optional[UploadFile] = File(None),
    orcrPhoto: Optional[UploadFile] = File(None),

    db: Session = Depends(get_db),
):
    from sqlalchemy import func
    anpr_flagged_bool = anprFlagged.lower() in ("true", "1", "yes")

    existing = db.query(User).filter(func.lower(User.email) == func.lower(email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    if idNumber:
        existing_id = db.query(User).filter(User.drivers_license_no == idNumber).first()
        if existing_id:
            raise HTTPException(status_code=400, detail="A user with this Driver's License number is already registered in the database.")
            
    existing_name = db.query(User).filter(
        func.lower(User.first_name) == func.lower(firstName),
        func.lower(User.last_name) == func.lower(lastName)
    ).first()
    if existing_name:
        raise HTTPException(status_code=400, detail="A user with this exact name is already registered in the database.")

    existing_vehicle = db.query(Vehicle).filter(Vehicle.plate_number == plateNumber.upper().strip()).first()
    if existing_vehicle:
        raise HTTPException(status_code=400, detail="A vehicle with this plate number is already registered.")

    full_name = f"{firstName} {middleName} {lastName}".replace("  ", " ").strip()
    username = email.split("@")[0].lower()
    counter = 1
    base_username = username
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    role = RELATIONSHIP_TO_ROLE.get(relationship.lower(), UserRole.visitor)
    reg_token = uuid.uuid4()

    new_user = User(
        email=email,
        username=username,
        password_hash=get_password_hash(password),
        first_name=firstName,
        middle_name=middleName or None,
        last_name=lastName,
        role=role,
        status=AccountStatus.pending,
        phone_number=phone,
        address=address,
        sex=sex.capitalize() if sex else None,
        nationality=nationality or 'Filipino',
        birth_date=birthDate or None,
        
        student_id=studentId,
        academic_program=course,
        year_level=yearLevel,
        section=section,
        
        faculty_id=facultyId,
        department=department,
        position=position,
        employment_type=employmentType,
        
        staff_id=staffId,
        staff_department=staffDepartment,
        job_title=jobTitle,
        employment_status=employmentStatus,
        
        visitor_purpose=visitorPurpose,
        visitor_host=visitorHost,
        visitor_reason=visitorReason,
        visitor_valid_id=visitorValidId,
        visitor_date=visitorDate,
        visitor_duration=visitorDuration,
        entry_motive=entryMotive,
        
        drivers_license_no=idNumber,
        registration_token=reg_token,
    )

    db.add(new_user)
    db.flush()

    if idPhoto and idPhoto.filename:
        ext = os.path.splitext(idPhoto.filename)[1] or ".jpg"
        id_filename = f"{reg_token}_id{ext}"
        id_dest = str(SECURE_UPLOADS_DIR / id_filename)
        _save_upload_file(idPhoto, id_dest)
        new_user.id_photo_path = id_dest

    if orcrPhoto and orcrPhoto.filename:
        ext = os.path.splitext(orcrPhoto.filename)[1] or ".jpg"
        orcr_filename = f"{reg_token}_orcr{ext}"
        orcr_dest = str(SECURE_UPLOADS_DIR / orcr_filename)
        _save_upload_file(orcrPhoto, orcr_dest)
        new_user.orcr_photo_path = orcr_dest

    qr_data = {
        "full_name": full_name,
        "plate_number": plateNumber.upper().strip(),
        "drivers_license": idNumber,
        "registration_token": str(reg_token),
    }
    qr_filename = f"{reg_token}_qr.png"
    qr_path = str(SECURE_UPLOADS_DIR / qr_filename)
    qr_base64 = _generate_qr_code(qr_data, qr_path)
    new_user.qr_code_path = qr_path

    try:
        v_type = VehicleType(vehicleType.lower())
    except ValueError:
        v_type = VehicleType.other

    new_vehicle = Vehicle(
        user_id=new_user.id,
        plate_number=plateNumber.upper().strip(),
        type=v_type,
        brand=brand,
        color=color or None,
        other_vehicle_type=otherVehicleType,
        status=VehicleStatus.pending,
        registration_date=datetime.now(),
        anpr_flagged=anpr_flagged_bool,
        anpr_flag_msg=anprFlagMsg
    )
    db.add(new_vehicle)

    if ocrScanJson:
        try:
            ocr_data = json.loads(ocrScanJson)
            from app.models.ocr_scan import OcrScan
            extracted = ocr_data.get("extractedData", {})
            confidence = ocr_data.get("confidenceScore")
            db.add(
                OcrScan(
                    user_id=new_user.id,
                    scan_type=(ocr_data.get("scanType") or "drivers_license")[:30],
                    front_image_url=ocr_data.get("frontImageUrl"),
                    back_image_url=ocr_data.get("backImageUrl"),
                    extracted_data=extracted,
                    confidence_score=confidence,
                    is_verified=False,
                    scan_id=ocr_data.get("scanId"),
                    raw_text=ocr_data.get("rawText"),
                )
            )
        except Exception:
            pass

    db.commit()
    db.refresh(new_user)
    db.refresh(new_vehicle)

    return {
        "success": True,
        "message": "Registration successful! Your account is pending admin approval.",
        "registration_token": str(reg_token),
        "qr_code_base64": qr_base64,
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
            "brand": new_vehicle.brand
        }
    }

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "first_name": current_user.first_name,
        "middle_name": current_user.middle_name,
        "last_name": current_user.last_name,
        "sex": current_user.sex.value if current_user.sex else None,
        "birth_date": str(current_user.birth_date) if current_user.birth_date else None,
        "nationality": current_user.nationality,
        "phone_number": current_user.phone_number,
        "address": current_user.address,
        "drivers_license_no": current_user.drivers_license_no,
        "license_expiry_date": str(current_user.license_expiry_date) if current_user.license_expiry_date else None,
        "academic_program": current_user.academic_program,
        "year_level": current_user.year_level,
        "role": current_user.role.value.lower(),
        "status": current_user.status.value,
        "student_id": current_user.student_id,
        "department": current_user.department
    }
