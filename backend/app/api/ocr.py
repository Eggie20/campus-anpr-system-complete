"""
OCR API Endpoints
Handles ID document scanning, text extraction, and training data management
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.utils.ocr import process_id_scan, correct_training_data, TRAINING_DATA_DIR
import os
import json

router = APIRouter()


class ExtractedData(BaseModel):
    lastName: str = ""
    firstName: str = ""
    middleName: str = ""
    fullName: str = ""
    nationality: str = ""
    birthDate: str = ""
    weight: str = ""
    height: str = ""
    address: str = ""
    licenseNumber: str = ""
    expiryDate: str = ""
    bloodType: str = ""
    eyesColor: str = ""
    dlCodes: str = ""
    conditions: str = ""
    emergencyName: str = ""
    emergencyAddress: str = ""
    emergencyTel: str = ""
    serialNumber: str = ""
    sex: str = ""
    plateNumber: str = ""


class OCRResponse(BaseModel):
    success: bool
    data: Dict[str, str]
    confidence: Dict[str, float]
    rawText: str
    scan_id: Optional[str] = None
    error: Optional[str] = None


@router.post("/scan-id", response_model=OCRResponse)
async def scan_id_document(
    front: UploadFile = File(..., description="Front image of the ID"),
    back: UploadFile = File(None, description="Back image of the ID (optional)")
):
    """
    Scan and extract information from an ID document (Driver's License, School ID, etc.)
    
    - **front**: Required. The front side of the ID document
    - **back**: Optional. The back side of the ID document
    
    Returns extracted fields like name, address, ID number, etc.
    """
    # Validate file types
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    
    if front.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type for front image. Allowed: {', '.join(allowed_types)}"
        )
    
    if back and back.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type for back image. Allowed: {', '.join(allowed_types)}"
        )
    
    # Validate file size (max 5MB each)
    max_size = 5 * 1024 * 1024  # 5MB
    
    front_content = await front.read()
    if len(front_content) > max_size:
        raise HTTPException(status_code=400, detail="Front image too large. Maximum size is 5MB.")
    
    back_content = None
    if back:
        back_content = await back.read()
        if len(back_content) > max_size:
            raise HTTPException(status_code=400, detail="Back image too large. Maximum size is 5MB.")
    
    # Process the images
    try:
        result = process_id_scan(front_content, back_content)
        
        if not result["success"]:
            return OCRResponse(
                success=False,
                data={},
                confidence={},
                rawText="",
                error=result.get("error", "OCR processing failed")
            )
        
        return OCRResponse(
            success=True,
            data=result["data"],
            confidence=result["confidence"],
            rawText=result["rawText"],
            scan_id=result.get("scan_id")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing error: {str(e)}"
        )


@router.get("/status")
async def ocr_status():
    """
    Check if OCR service is available and Tesseract is ready
    """
    try:
        import pytesseract
        from app.utils.ocr import TESSERACT_CMD
        
        # Check version
        version = pytesseract.get_tesseract_version()
        return {
            "status": "available",
            "engine": "Tesseract",
            "version": str(version),
            "command": TESSERACT_CMD,
            "message": f"OCR service is ready using Tesseract {version}"
        }
    except Exception as e:
        return {
            "status": "unavailable",
            "engine": "Tesseract",
            "message": f"Tesseract not ready. Error: {str(e)}"
        }


@router.get("/test-sample")
async def test_sample_id():
    """
    Test OCR with sample ID images from the ID_card folder
    Returns extracted data for verification
    """
    import os
    
    # Find sample images
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    id_card_path = os.path.join(base_path, "ID_card")
    
    front_path = os.path.join(id_card_path, "front_ID.jpg")
    back_path = os.path.join(id_card_path, "back_ID.jpg")
    
    if not os.path.exists(front_path):
        return {
            "success": False,
            "error": f"Sample front ID not found at: {front_path}",
            "data": {}
        }
    
    if not os.path.exists(back_path):
        return {
            "success": False, 
            "error": f"Sample back ID not found at: {back_path}",
            "data": {}
        }
    
    # Read sample images
    with open(front_path, "rb") as f:
        front_content = f.read()
    
    with open(back_path, "rb") as f:
        back_content = f.read()
    
    # Process with OCR
    result = process_id_scan(front_content, back_content)
    
    return {
        "success": result["success"],
        "data": result.get("data", {}),
        "confidence": result.get("confidence", {}),
        "rawText": result.get("rawText", "")[:500],  # First 500 chars
        "sample_images": {
            "front": front_path,
            "back": back_path
        }
    }


# ============================================================
# Training Data Management Endpoints
# ============================================================

class CorrectionRequest(BaseModel):
    scan_id: str
    corrected_text: str


@router.post("/correct-training")
async def correct_training(req: CorrectionRequest):
    """
    Submit corrected OCR text for a training scan.
    This updates the .gt.txt ground truth file used for Tesseract fine-tuning.
    
    - **scan_id**: The base name of the scan (e.g., 'ph_id_20260212_123845_fcca3f5e')
    - **corrected_text**: The correct text that should have been extracted
    """
    success = correct_training_data(req.scan_id, req.corrected_text)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Training scan '{req.scan_id}' not found in training_data/"
        )
    return {
        "success": True,
        "message": f"Ground truth updated for {req.scan_id}"
    }


@router.get("/training-data")
async def list_training_data():
    """
    List all available training data scans with their metadata.
    Useful for reviewing which scans need manual correction.
    """
    if not os.path.exists(TRAINING_DATA_DIR):
        return {"scans": [], "total": 0}

    scans = []
    seen = set()

    for f in os.listdir(TRAINING_DATA_DIR):
        if f.endswith(".meta.json"):
            scan_id = f.replace(".meta.json", "")
            if scan_id in seen:
                continue
            seen.add(scan_id)
            try:
                with open(os.path.join(TRAINING_DATA_DIR, f), "r") as mf:
                    meta = json.load(mf)
                # Check which files exist for this scan
                meta["has_tif"] = os.path.exists(os.path.join(TRAINING_DATA_DIR, f"{scan_id}.tif"))
                meta["has_box"] = os.path.exists(os.path.join(TRAINING_DATA_DIR, f"{scan_id}.box"))
                meta["has_gt"] = os.path.exists(os.path.join(TRAINING_DATA_DIR, f"{scan_id}.gt.txt"))
                scans.append(meta)
            except Exception:
                continue

    return {
        "scans": scans,
        "total": len(scans),
        "corrected_count": sum(1 for s in scans if s.get("corrected")),
        "ready_for_training": sum(1 for s in scans if s.get("has_tif") and s.get("has_box") and s.get("has_gt"))
    }
